'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ExtendedPhysicsState } from '@/lib/physics/kinematics'
import { MapDefinition, SensorConfigItem, RobotSpec } from '@/types/project'
import { ObstacleItem } from '@/types/obstacle'
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
  obstacles?: ObstacleItem[]
  selectedObstacleId?: string | null
  onSelectObstacle?: (id: string | null) => void
  onUpdateObstacle?: (obs: ObstacleItem) => void
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
  theme = 'dark',
  obstacles = [],
  selectedObstacleId = null,
  onSelectObstacle,
  onUpdateObstacle
}: Canvas3DRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const robotGroupRef = useRef<THREE.Group | null>(null)
  const obstaclesGroupRef = useRef<THREE.Group | null>(null)
  const sensorsGroupRef = useRef<THREE.Group | null>(null)
  const trailLineRef = useRef<THREE.Line | null>(null)
  const leftWheelRef = useRef<THREE.Object3D | null>(null)
  const rightWheelRef = useRef<THREE.Object3D | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const planeRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  const isDraggingRef = useRef<boolean>(false)
  const dragTargetRef = useRef<'robot' | 'obstacle' | null>(null)
  const activeObstacleIdRef = useRef<string | null>(null)

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
    dirLight.shadow.camera.left = -3
    dirLight.shadow.camera.right = 3
    dirLight.shadow.camera.top = 3
    dirLight.shadow.camera.bottom = -3
    scene.add(dirLight)

    // 4. Map Floor Mesh
    const fieldW = mapWidthMm / 1000
    const fieldH = mapHeightMm / 1000

    const mapTextureCanvas = mapDef.imageUrl ? null : generateBuiltinMapCanvas(mapDef, 2048)
    let texture: THREE.CanvasTexture | THREE.Texture

    if (mapDef.imageUrl) {
      const loader = new THREE.TextureLoader()
      texture = loader.load(mapDef.imageUrl)
    } else if (mapTextureCanvas) {
      texture = new THREE.CanvasTexture(mapTextureCanvas)
    } else {
      texture = new THREE.Texture()
    }
    texture.colorSpace = THREE.SRGBColorSpace

    const planeGeo = new THREE.PlaneGeometry(fieldW, fieldH)
    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.4,
      metalness: 0.1
    })

    const mapMesh = new THREE.Mesh(planeGeo, planeMat)
    mapMesh.rotation.x = -Math.PI / 2
    mapMesh.receiveShadow = true
    scene.add(mapMesh)

    // Outer Table border
    const borderGeo = new THREE.BoxGeometry(fieldW + 0.1, 0.04, fieldH + 0.1)
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    const borderMesh = new THREE.Mesh(borderGeo, borderMat)
    borderMesh.position.y = -0.021
    scene.add(borderMesh)

    // 5. Create Obstacles Group
    const obstaclesGroup = new THREE.Group()
    obstaclesGroup.name = 'obstacles_group'
    scene.add(obstaclesGroup)
    obstaclesGroupRef.current = obstaclesGroup

    // 6. Robot Chassis 3D Object Group
    const robotGroup = new THREE.Group()
    scene.add(robotGroup)
    robotGroupRef.current = robotGroup

    const bodyW = (robotSpec?.bodyWidth || 140) / 1000
    const bodyL = (robotSpec?.bodyLength || 160) / 1000
    const bodyH = 0.05
    const robotHexColor = parseInt((robotSpec?.color || '#06b6d4').replace('#', '0x'), 16)

    const chassisGeo = new THREE.BoxGeometry(bodyL, bodyH, bodyW)
    const chassisMat = new THREE.MeshStandardMaterial({
      color: robotHexColor,
      roughness: 0.3,
      metalness: 0.6
    })
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat)
    chassisMesh.position.y = bodyH / 2 + 0.015
    chassisMesh.castShadow = true
    chassisMesh.receiveShadow = true
    robotGroup.add(chassisMesh)

    // Board Top Plate
    const boardGeo = new THREE.BoxGeometry(bodyL * 0.5, 0.01, bodyW * 0.6)
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    const boardMesh = new THREE.Mesh(boardGeo, boardMat)
    boardMesh.position.y = bodyH + 0.015
    robotGroup.add(boardMesh)

    // Left & Right Wheels
    const wRadius = (robotSpec?.wheelRadius || 30) / 1000
    const wThick = 0.012
    const wBase = (robotSpec?.wheelBase || 140) / 1000

    const wheelGeo = new THREE.CylinderGeometry(wRadius, wRadius, wThick, 24)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })

    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat)
    leftWheel.rotation.x = Math.PI / 2
    leftWheel.position.set(0, wRadius, -wBase / 2)
    leftWheel.castShadow = true
    robotGroup.add(leftWheel)
    leftWheelRef.current = leftWheel

    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat)
    rightWheel.rotation.x = Math.PI / 2
    rightWheel.position.set(0, wRadius, wBase / 2)
    rightWheel.castShadow = true
    robotGroup.add(rightWheel)
    rightWheelRef.current = rightWheel

    // Front Nose Arrow
    const noseGeo = new THREE.ConeGeometry(0.02, 0.04, 3)
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const noseMesh = new THREE.Mesh(noseGeo, noseMat)
    noseMesh.rotation.z = -Math.PI / 2
    noseMesh.position.set(bodyL / 2 + 0.02, bodyH / 2 + 0.015, 0)
    robotGroup.add(noseMesh)

    // 7. Sensors 3D Models
    const sensorsGroup = new THREE.Group()
    robotGroup.add(sensorsGroup)
    sensorsGroupRef.current = sensorsGroup

    // 8. Motion Trail Line
    const trailMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 })
    const trailGeo = new THREE.BufferGeometry()
    const trailLine = new THREE.Line(trailGeo, trailMat)
    scene.add(trailLine)
    trailLineRef.current = trailLine

    // Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      camera.aspect = (r.width || 800) / (r.height || 600)
      camera.updateProjectionMatrix()
      renderer.setSize(r.width || 800, r.height || 600)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [mapDef, boardType, robotSpec, theme])

  // Update 3D Obstacles
  useEffect(() => {
    if (!obstaclesGroupRef.current) return
    const group = obstaclesGroupRef.current
    group.clear()

    obstacles.forEach((obs) => {
      const fieldW = mapDef.widthMm / 1000
      const fieldH = mapDef.heightMm / 1000

      const posX = obs.x / 1000 - fieldW / 2
      const posZ = obs.y / 1000 - fieldH / 2
      const isSelected = obs.id === selectedObstacleId

      let mesh: THREE.Mesh
      const rotY = -(obs.rotation * Math.PI) / 180

      if (obs.type === 'cylinder') {
        const radius = obs.width / 2000
        const height = 0.08
        const geo = new THREE.CylinderGeometry(radius, radius, height, 32)
        const mat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x38bdf8 : parseInt((obs.color || '#0284c7').replace('#', '0x'), 16),
          roughness: 0.3,
          metalness: 0.4
        })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(posX, height / 2, posZ)
        mesh.rotation.y = rotY
      } else {
        const w = obs.width / 1000
        const l = obs.height / 1000
        const h = obs.type === 'wall' ? 0.08 : 0.06
        const geo = new THREE.BoxGeometry(w, h, l)
        const mat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x38bdf8 : parseInt((obs.color || '#d97706').replace('#', '0x'), 16),
          roughness: 0.5,
          metalness: 0.2
        })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(posX, h / 2, posZ)
        mesh.rotation.y = rotY
      }

      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { id: obs.id, type: 'obstacle' }
      group.add(mesh)
    })
  }, [obstacles, selectedObstacleId, mapDef])

  // Update Physics Position & Sensors
  useEffect(() => {
    if (!robotGroupRef.current) return
    const fieldW = mapDef.widthMm / 1000
    const fieldH = mapDef.heightMm / 1000

    const posThreeX = physicsState.x / 1000 - fieldW / 2
    const posThreeZ = physicsState.y / 1000 - fieldH / 2

    robotGroupRef.current.position.set(posThreeX, 0, posThreeZ)
    robotGroupRef.current.rotation.y = -physicsState.heading

    if (showTrail && trailPath.length > 1 && trailLineRef.current) {
      const points: THREE.Vector3[] = []
      trailPath.forEach((pt) => {
        points.push(new THREE.Vector3(pt.x / 1000 - fieldW / 2, 0.005, pt.y / 1000 - fieldH / 2))
      })
      trailLineRef.current.geometry.setFromPoints(points)
      trailLineRef.current.visible = true
    } else if (trailLineRef.current) {
      trailLineRef.current.visible = false
    }
  }, [physicsState, mapDef, showTrail, trailPath])

  // 3D Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !robotGroupRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current)

    // Check Robot Hit
    const robotIntersects = raycasterRef.current.intersectObjects(robotGroupRef.current.children, true)
    if (robotIntersects.length > 0) {
      isDraggingRef.current = true
      dragTargetRef.current = 'robot'
      containerRef.current.setPointerCapture(e.pointerId)
      if (controlsRef.current) controlsRef.current.enabled = false
      return
    }

    // Check Obstacles Hit
    if (obstaclesGroupRef.current) {
      const obsIntersects = raycasterRef.current.intersectObjects(obstaclesGroupRef.current.children, true)
      if (obsIntersects.length > 0) {
        const obsObj = obsIntersects[0].object
        const obsId = obsObj.userData?.id
        if (obsId) {
          isDraggingRef.current = true
          dragTargetRef.current = 'obstacle'
          activeObstacleIdRef.current = obsId
          if (onSelectObstacle) onSelectObstacle(obsId)
          containerRef.current.setPointerCapture(e.pointerId)
          if (controlsRef.current) controlsRef.current.enabled = false
          return
        }
      }
    }

    if (onSelectObstacle) onSelectObstacle(null)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current || !cameraRef.current) return

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

      if (dragTargetRef.current === 'robot' && onRepositionRobot) {
        onRepositionRobot(clampedX, clampedY)
      } else if (dragTargetRef.current === 'obstacle' && activeObstacleIdRef.current && onUpdateObstacle) {
        const obs = obstacles.find((o) => o.id === activeObstacleIdRef.current)
        if (obs) {
          onUpdateObstacle({ ...obs, x: clampedX, y: clampedY })
        }
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      dragTargetRef.current = null
      activeObstacleIdRef.current = null
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
        Drag Robot/Obstacles to Reposition | Left Drag Scene = Rotate | Right Drag = Pan | Scroll = Zoom
      </div>
    </div>
  )
}
