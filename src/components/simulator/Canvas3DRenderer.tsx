'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ExtendedPhysicsState } from '@/lib/physics/kinematics'
import { MapDefinition, SensorConfigItem, RobotSpec } from '@/types/project'
import { generateBuiltinMapCanvas } from '@/lib/mapRenderer'
import { HardwareState } from '@/lib/interpreter/boards'

interface Canvas3DRendererProps {
  physicsState: ExtendedPhysicsState
  mapDef: MapDefinition
  boardType: string
  robotSpec?: RobotSpec
  trailPath?: { x: number; y: number }[]
  showSensorsOverlay?: boolean
  showTrail?: boolean
  sensors?: SensorConfigItem[]
  hwState?: HardwareState
  onRepositionRobot?: (x: number, y: number) => void
  theme?: 'dark' | 'light'
}

export function Canvas3DRenderer({
  physicsState,
  mapDef,
  boardType,
  robotSpec,
  trailPath = [],
  showSensorsOverlay = true,
  showTrail = true,
  sensors = [],
  hwState,
  onRepositionRobot,
  theme = 'dark'
}: Canvas3DRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const robotGroupRef = useRef<THREE.Group | null>(null)
  const sensorsGroupRef = useRef<THREE.Group | null>(null)
  const trailLineRef = useRef<THREE.Line | null>(null)
  const leftWheelRef = useRef<THREE.Object3D | null>(null)
  const rightWheelRef = useRef<THREE.Object3D | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const planeRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  const isDraggingRef = useRef<boolean>(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const width = rect.width || 800
    const height = rect.height || 600

    const mapWidthMm = mapDef.widthMm
    const mapHeightMm = mapDef.heightMm

    // 1. Create Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const bgColor = theme === 'light' ? 0xf8fafc : 0x020617
    scene.background = new THREE.Color(bgColor)
    scene.fog = new THREE.FogExp2(bgColor, 0.1)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 30)
    camera.position.set(0, 3.5, 3.5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap

    container.appendChild(renderer.domElement)

    // 2. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.05
    controls.minDistance = 0.5
    controls.maxDistance = 8
    controlsRef.current = controls

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(3, 6, 4)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.bias = -0.0005
    dirLight.shadow.normalBias = 0.02
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 15
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 5)
    pointLight.position.set(0, 1.5, 0)
    scene.add(pointLight)

    // 4. Load Map Texture for 3D Floor Plane
    const mapW_m = mapWidthMm / 1000
    const mapH_m = mapHeightMm / 1000

    let floorTexture: THREE.Texture
    if (mapDef.imageUrl) {
      floorTexture = new THREE.TextureLoader().load(mapDef.imageUrl)
    } else {
      const mapCanvas = generateBuiltinMapCanvas(mapDef, 2400)
      floorTexture = new THREE.CanvasTexture(mapCanvas)
    }
    floorTexture.colorSpace = THREE.SRGBColorSpace

    const floorGeo = new THREE.PlaneGeometry(mapW_m, mapH_m)
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.3,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    })
    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.rotation.x = -Math.PI / 2
    floorMesh.receiveShadow = true
    scene.add(floorMesh)

    // Floor Boundary Border Frame (Positioned slightly below y=0 to eliminate Z-fighting)
    const borderGeo = new THREE.BoxGeometry(mapW_m + 0.04, 0.02, mapH_m + 0.04)
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    const borderMesh = new THREE.Mesh(borderGeo, borderMat)
    borderMesh.position.y = -0.012
    scene.add(borderMesh)

    // Floor Grid Helper
    const gridHelper = new THREE.GridHelper(Math.max(mapW_m, mapH_m), 20, 0x0284c7, 0x1e293b)
    gridHelper.position.y = 0.001
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach((m) => {
        m.polygonOffset = true
        m.polygonOffsetFactor = -1
        m.polygonOffsetUnits = -1
      })
    } else {
      gridHelper.material.polygonOffset = true
      gridHelper.material.polygonOffsetFactor = -1
      gridHelper.material.polygonOffsetUnits = -1
    }
    scene.add(gridHelper)

    // Motion Trail Line in 3D Scene
    const trailGeo = new THREE.BufferGeometry()
    const trailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    })
    const trailLine = new THREE.Line(trailGeo, trailMat)
    trailLine.position.y = 0.003
    trailLine.visible = showTrail && trailPath.length > 1
    scene.add(trailLine)
    trailLineRef.current = trailLine

    // 5. 3D Robot Model Group
    const robotGroup = new THREE.Group()
    robotGroupRef.current = robotGroup

    const bodyL_m = (robotSpec?.bodyLength || 160) / 1000
    const bodyW_m = (robotSpec?.bodyWidth || 140) / 1000
    const wheelBase_m = (robotSpec?.wheelBase || 140) / 1000
    const wheelRadius_m = (robotSpec?.wheelRadius || 30) / 1000
    const themeColorHex = robotSpec?.color ? parseInt(robotSpec.color.replace('#', ''), 16) : 0x06b6d4

    // Main Body Chassis
    const chassisGeo = new THREE.BoxGeometry(bodyL_m, 0.06, bodyW_m)
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.8
    })
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat)
    chassisMesh.position.y = 0.04
    chassisMesh.castShadow = true
    robotGroup.add(chassisMesh)

    // Top Board Display Plate
    const plateGeo = new THREE.BoxGeometry(bodyL_m * 0.5, 0.015, bodyW_m * 0.5)
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 })
    const plateMesh = new THREE.Mesh(plateGeo, plateMat)
    plateMesh.position.set(0, 0.075, 0)
    robotGroup.add(plateMesh)

    // Front Direction Light/Nose
    const noseGeo = new THREE.ConeGeometry(0.025, 0.04, 4)
    const noseMat = new THREE.MeshBasicMaterial({ color: themeColorHex })
    const noseMesh = new THREE.Mesh(noseGeo, noseMat)
    noseMesh.rotation.z = -Math.PI / 2
    noseMesh.position.set(bodyL_m / 2 + 0.01, 0.04, 0)
    robotGroup.add(noseMesh)

    // Left & Right Wheels
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius_m, wheelRadius_m, 0.016, 24)
    wheelGeo.rotateX(Math.PI / 2)

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.3 })
    const spokeMat = new THREE.MeshStandardMaterial({ color: themeColorHex, roughness: 0.3 })
    const spokeGeo = new THREE.BoxGeometry(wheelRadius_m * 1.6, 0.006, 0.018)

    // Left Wheel Group
    const leftWheelGroup = new THREE.Group()
    leftWheelGroup.position.set(0, wheelRadius_m, -wheelBase_m / 2 - 0.008)
    const leftWheelMesh = new THREE.Mesh(wheelGeo, wheelMat)
    leftWheelMesh.castShadow = true
    leftWheelGroup.add(leftWheelMesh)

    const leftSpoke = new THREE.Mesh(spokeGeo, spokeMat)
    leftWheelGroup.add(leftSpoke)
    leftWheelRef.current = leftWheelGroup
    robotGroup.add(leftWheelGroup)

    // Right Wheel Group
    const rightWheelGroup = new THREE.Group()
    rightWheelGroup.position.set(0, wheelRadius_m, wheelBase_m / 2 + 0.008)
    const rightWheelMesh = new THREE.Mesh(wheelGeo, wheelMat)
    rightWheelMesh.castShadow = true
    rightWheelGroup.add(rightWheelMesh)

    const rightSpoke = new THREE.Mesh(spokeGeo, spokeMat)
    rightWheelGroup.add(rightSpoke)
    rightWheelRef.current = rightWheelGroup
    robotGroup.add(rightWheelGroup)

    // Dynamic 3D Sensors Group Attached to Robot Chassis
    const sensorsGroup = new THREE.Group()
    sensorsGroup.name = 'sensorsGroup'
    sensorsGroupRef.current = sensorsGroup
    sensorsGroup.visible = showSensorsOverlay

    sensors.forEach((s) => {
      if (!s.enabled) return
      const sensorX_m = s.offsetX / 1000
      const sensorZ_m = s.offsetY / 1000

      if (s.type === 'IR_LINE') {
        const irGroup = new THREE.Group()
        irGroup.name = `sensor_ir_${s.id}_${s.pin}`
        irGroup.position.set(sensorX_m, 0, sensorZ_m)

        // 1. Floor spot disc (on track floor)
        const discGeo = new THREE.CircleGeometry(0.009, 16)
        discGeo.rotateX(-Math.PI / 2)
        const discMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95
        })
        const discMesh = new THREE.Mesh(discGeo, discMat)
        discMesh.position.y = 0.004
        discMesh.name = 'floor_spot'
        irGroup.add(discMesh)

        // 2. Vertical sensor stem probe
        const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.07, 8)
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
        const stemMesh = new THREE.Mesh(stemGeo, stemMat)
        stemMesh.position.y = 0.038
        irGroup.add(stemMesh)

        // 3. Top-mounted glowing LED indicator
        const ledGeo = new THREE.SphereGeometry(0.007, 12, 12)
        const ledMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.2,
          emissive: 0x059669,
          emissiveIntensity: 0.8
        })
        const ledMesh = new THREE.Mesh(ledGeo, ledMat)
        ledMesh.position.y = 0.075
        ledMesh.name = 'top_led'
        irGroup.add(ledMesh)

        sensorsGroup.add(irGroup)
      } else if (s.type === 'DISTANCE_TOF') {
        const tofGroup = new THREE.Group()
        tofGroup.name = `sensor_tof_${s.id}_${s.pin}`
        tofGroup.position.set(sensorX_m, 0.045, sensorZ_m)
        tofGroup.rotation.y = -(s.angle * Math.PI) / 180

        const tofGeo = new THREE.BoxGeometry(0.014, 0.012, 0.018)
        const tofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
        const tofMesh = new THREE.Mesh(tofGeo, tofMat)
        tofGroup.add(tofMesh)

        // Laser line projecting forward
        const laserGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.4, 0, 0)
        ])
        const laserMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
        const laserLine = new THREE.Line(laserGeo, laserMat)
        tofGroup.add(laserLine)

        sensorsGroup.add(tofGroup)
      } else if (s.type === 'GYRO_IMU') {
        const gyroGeo = new THREE.BoxGeometry(0.016, 0.008, 0.016)
        const gyroMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2 })
        const gyroMesh = new THREE.Mesh(gyroGeo, gyroMat)
        gyroMesh.position.set(sensorX_m, 0.076, sensorZ_m)
        sensorsGroup.add(gyroMesh)
      }
    })

    robotGroup.add(sensorsGroup)
    scene.add(robotGroup)

    // 6. Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // 7. Handle Window & Container Resize
    const handleResize = () => {
      if (!containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      if (r.width < 10 || r.height < 10) return
      camera.aspect = r.width / r.height
      camera.updateProjectionMatrix()
      renderer.setSize(r.width, r.height)
    }
    window.addEventListener('resize', handleResize)

    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      controls.dispose()
      floorTexture.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [mapDef, boardType, robotSpec, sensors, theme])

  // Update 3D Robot Position & Orientation from Physics State
  useEffect(() => {
    const robotGroup = robotGroupRef.current
    if (!robotGroup) return

    const worldX = (physicsState.x - mapDef.widthMm / 2) / 1000
    const worldZ = (physicsState.y - mapDef.heightMm / 2) / 1000

    robotGroup.position.set(worldX, 0, worldZ)
    robotGroup.rotation.y = -physicsState.heading

    if (leftWheelRef.current) {
      leftWheelRef.current.rotation.z -= (physicsState.leftWheelSpeed / 30) * 0.016
    }
    if (rightWheelRef.current) {
      rightWheelRef.current.rotation.z -= (physicsState.rightWheelSpeed / 30) * 0.016
    }
  }, [physicsState, mapDef])

  // Update 3D Motion Trail geometry & visibility
  useEffect(() => {
    const trailLine = trailLineRef.current
    if (!trailLine) return

    const shouldShow = showTrail && trailPath.length > 1
    trailLine.visible = shouldShow

    if (shouldShow) {
      const positions = new Float32Array(trailPath.length * 3)
      for (let i = 0; i < trailPath.length; i++) {
        positions[i * 3] = (trailPath[i].x - mapDef.widthMm / 2) / 1000
        positions[i * 3 + 1] = 0.003
        positions[i * 3 + 2] = (trailPath[i].y - mapDef.heightMm / 2) / 1000
      }
      trailLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      trailLine.geometry.attributes.position.needsUpdate = true
      trailLine.geometry.computeBoundingSphere()
    }
  }, [trailPath, showTrail, mapDef])

  // Toggle 3D Sensor Overlay visibility
  useEffect(() => {
    if (sensorsGroupRef.current) {
      sensorsGroupRef.current.visible = showSensorsOverlay
    }
  }, [showSensorsOverlay])

  // Dynamic real-time 3D sensor reading updates (IR LEDs & TOF Laser ray)
  useEffect(() => {
    if (!sensorsGroupRef.current || !hwState || !showSensorsOverlay) return

    sensors.forEach((s) => {
      if (!s.enabled) return

      if (s.type === 'IR_LINE') {
        const irGroup = sensorsGroupRef.current?.getObjectByName(`sensor_ir_${s.id}_${s.pin}`) as THREE.Group
        if (irGroup) {
          const isLine = hwState.digitalPins[s.pin] === 1
          const topLed = irGroup.getObjectByName('top_led') as THREE.Mesh
          const floorSpot = irGroup.getObjectByName('floor_spot') as THREE.Mesh

          if (topLed && topLed.material) {
            const mat = topLed.material as THREE.MeshStandardMaterial
            if (isLine) {
              mat.color.setHex(0x10b981) // Emerald
              mat.emissive.setHex(0x059669)
            } else {
              mat.color.setHex(0xef4444) // Red
              mat.emissive.setHex(0x991b1b)
            }
          }

          if (floorSpot && floorSpot.material) {
            const mat = floorSpot.material as THREE.MeshBasicMaterial
            mat.color.setHex(isLine ? 0x10b981 : 0xef4444)
          }
        }
      } else if (s.type === 'DISTANCE_TOF') {
        const tofGroup = sensorsGroupRef.current?.getObjectByName(`sensor_tof_${s.id}_${s.pin}`) as THREE.Group
        if (tofGroup) {
          const laserLine = tofGroup.children.find((c) => c instanceof THREE.Line) as THREE.Line
          if (laserLine) {
            const readingCm = hwState.analogPins[s.pin] ?? 200
            const readingM = Math.min(2, Math.max(0.02, readingCm / 100))
            const positions = new Float32Array([0, 0, 0, readingM, 0, 0])
            laserLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            laserLine.geometry.attributes.position.needsUpdate = true
          }
        }
      }
    })
  }, [physicsState, hwState, sensors, showSensorsOverlay])

  // 3D Pointer Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !robotGroupRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current)

    const intersects = raycasterRef.current.intersectObjects(robotGroupRef.current.children, true)
    if (intersects.length > 0) {
      isDraggingRef.current = true
      containerRef.current.setPointerCapture(e.pointerId)
      if (controlsRef.current) controlsRef.current.enabled = false
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current || !cameraRef.current || !onRepositionRobot) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current)

    const intersectPt = new THREE.Vector3()
    if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPt)) {
      const mapX = intersectPt.x * 1000 + mapDef.widthMm / 2
      const mapY = intersectPt.z * 1000 + mapDef.heightMm / 2

      const margin = 80
      const clampedX = Math.max(margin, Math.min(mapDef.widthMm - margin, mapX))
      const clampedY = Math.max(margin, Math.min(mapDef.heightMm - margin, mapY))

      onRepositionRobot(clampedX, clampedY)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      if (controlsRef.current) controlsRef.current.enabled = true
      if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="w-full h-full relative overflow-hidden bg-slate-950 touch-none"
    >
      <div className="absolute bottom-3 left-3 z-10 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
        Drag Robot to Reposition | Left Drag Scene = Rotate | Right Drag = Pan | Scroll = Zoom
      </div>
    </div>
  )
}

