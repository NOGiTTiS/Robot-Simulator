'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ExtendedPhysicsState } from '@/lib/physics/kinematics'
import { MapDefinition, SensorConfigItem, RobotSpec } from '@/types/project'
import { ObstacleItem } from '@/types/obstacle'
import { generateBuiltinMapCanvas } from '@/lib/mapRenderer'
import { samplePixelColor, raycastDistanceTof } from '@/lib/physics/mapSampler'
import { HardwareState } from '@/lib/interpreter/boards'

interface Canvas2DRendererProps {
  physicsState: ExtendedPhysicsState
  mapDef: MapDefinition
  boardType: string
  robotSpec?: RobotSpec
  trailPath: { x: number; y: number }[]
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

export function Canvas2DRenderer({
  physicsState,
  mapDef,
  boardType,
  robotSpec,
  trailPath,
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
}: Canvas2DRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const customImgRef = useRef<HTMLImageElement | null>(null)

  const isDraggingRef = useRef<boolean>(false)
  const dragModeRef = useRef<'robot' | 'obstacle' | 'rotate_obs' | null>(null)
  const draggingObsIdRef = useRef<string | null>(null)

  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // Cache transform for mouse event coordinate conversions
  const transformRef = useRef<{ offsetX: number; offsetY: number; scale: number }>({
    offsetX: 0,
    offsetY: 0,
    scale: 1
  })

  // Load / Generate Map Background Offscreen Canvas
  useEffect(() => {
    if (mapDef.imageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = mapDef.imageUrl
      img.onload = () => {
        customImgRef.current = img
        const offCanvas = document.createElement('canvas')
        offCanvas.width = 2400
        offCanvas.height = Math.round(2400 * (mapDef.heightMm / mapDef.widthMm))
        const ctx = offCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height)
          mapCanvasRef.current = offCanvas
        }
      }
    } else {
      customImgRef.current = null
      mapCanvasRef.current = generateBuiltinMapCanvas(mapDef, 2400)
    }
  }, [mapDef])

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    if (rect.width < 20 || rect.height < 20) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.save()
    ctx.scale(dpr, dpr)

    // Calculate aspect ratio fit inside container
    const padding = 20
    const availWidth = Math.max(20, rect.width - padding * 2)
    const availHeight = Math.max(20, rect.height - padding * 2)
    const mapAspect = mapDef.widthMm / mapDef.heightMm
    const containerAspect = availWidth / availHeight

    let drawWidth = availWidth
    let drawHeight = availHeight
    if (containerAspect > mapAspect) {
      drawWidth = availHeight * mapAspect
    } else {
      drawHeight = availWidth / mapAspect
    }

    const offsetX = (rect.width - drawWidth) / 2
    const offsetY = (rect.height - drawHeight) / 2
    const scale = drawWidth / mapDef.widthMm // Canvas pixels per mm

    transformRef.current = { offsetX, offsetY, scale }

    // Clear outer background
    ctx.fillStyle = theme === 'light' ? '#f8fafc' : '#020617'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw Map Frame Background (Custom Image or Procedural Canvas)
    if (customImgRef.current) {
      ctx.drawImage(customImgRef.current, offsetX, offsetY, drawWidth, drawHeight)
    } else if (mapCanvasRef.current) {
      ctx.drawImage(mapCanvasRef.current, offsetX, offsetY, drawWidth, drawHeight)
    } else {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight)
    }

    // Outer Field Border Glow
    ctx.strokeStyle = '#38bdf880'
    ctx.lineWidth = 2
    ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight)

    // Draw Robot Motion Trail
    if (showTrail && trailPath.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#38bdf880'
      ctx.lineWidth = Math.max(2, 3 * scale)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < trailPath.length; i++) {
        const ptX = offsetX + trailPath[i].x * scale
        const ptY = offsetY + trailPath[i].y * scale
        if (i === 0) ctx.moveTo(ptX, ptY)
        else ctx.lineTo(ptX, ptY)
      }
      ctx.stroke()
    }

    // --- DRAW INTERACTIVE OBSTACLES ---
    obstacles.forEach((obs) => {
      const obsCanvasX = offsetX + obs.x * scale
      const obsCanvasY = offsetY + obs.y * scale
      const obsW = obs.width * scale
      const obsH = obs.height * scale
      const isSelected = obs.id === selectedObstacleId

      ctx.save()
      ctx.translate(obsCanvasX, obsCanvasY)
      ctx.rotate((obs.rotation * Math.PI) / 180)

      if (obs.type === 'cylinder') {
        const radius = obsW / 2
        // Glow / Selection
        if (isSelected) {
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, radius + 4, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Gradient 3D Cylinder Fill
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius)
        grad.addColorStop(0, '#38bdf8')
        grad.addColorStop(0.7, obs.color || '#0284c7')
        grad.addColorStop(1, '#0c4a6e')

        ctx.fillStyle = grad
        ctx.strokeStyle = '#0284c7'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Center dot
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(0, 0, 3, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Box or Wall
        if (isSelected) {
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 3
          ctx.strokeRect(-obsW / 2 - 3, -obsH / 2 - 3, obsW + 6, obsH + 6)
        }

        ctx.fillStyle = obs.color || (obs.type === 'wall' ? '#475569' : '#d97706')
        ctx.strokeStyle = obs.type === 'wall' ? '#334155' : '#92400e'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.roundRect(-obsW / 2, -obsH / 2, obsW, obsH, Math.min(8, obsW * 0.1))
        ctx.fill()
        ctx.stroke()

        // Texture for box/wall
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(-obsW / 2 + 6, -obsH / 2 + 6)
        ctx.lineTo(obsW / 2 - 6, obsH / 2 - 6)
        ctx.stroke()
      }

      // If Selected: Draw Rotate Handle & Glow Ring
      if (isSelected) {
        // Connecting line from top edge to rotate handle
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, -obsH / 2)
        ctx.lineTo(0, -obsH / 2 - 20)
        ctx.stroke()

        // Handle Circle
        ctx.fillStyle = '#38bdf8'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(0, -obsH / 2 - 20, 9, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Center dot inside handle
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(0, -obsH / 2 - 20, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })

    // --- DRAW ROBOT CHASSIS & SENSORS ---
    const robotX = offsetX + physicsState.x * scale
    const robotY = offsetY + physicsState.y * scale
    const robotWidth = (robotSpec?.bodyWidth || 140) * scale
    const robotLength = (robotSpec?.bodyLength || 160) * scale
    const wheelBase = (robotSpec?.wheelBase || 140) * scale
    const wheelRadius = (robotSpec?.wheelRadius || 30) * scale
    const robotColor = robotSpec?.color || '#06b6d4'

    ctx.save()
    ctx.translate(robotX, robotY)

    // Interactive Hover/Drag Glow
    if (isDragging && dragModeRef.current === 'robot') {
      ctx.strokeStyle = robotColor
      ctx.lineWidth = 3
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.arc(0, 0, robotLength * 0.8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = `${robotColor}33`
      ctx.beginPath()
      ctx.arc(0, 0, robotLength * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.rotate(physicsState.heading)

    // Wheel Slip Warning Aura
    if (physicsState.slipRatio > 0.05) {
      ctx.fillStyle = `rgba(239, 68, 68, ${Math.min(0.6, physicsState.slipRatio * 2)})`
      ctx.beginPath()
      ctx.arc(0, 0, robotLength * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Left & Right Wheels
    ctx.fillStyle = '#0f172a'
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1.5
    const wheelWidth = 14 * scale
    const wheelLength = wheelRadius * 2 * scale
    ctx.fillRect(-wheelLength / 2, -wheelBase / 2 - wheelWidth / 2, wheelLength, wheelWidth)
    ctx.strokeRect(-wheelLength / 2, -wheelBase / 2 - wheelWidth / 2, wheelLength, wheelWidth)

    ctx.fillRect(-wheelLength / 2, wheelBase / 2 - wheelWidth / 2, wheelLength, wheelWidth)
    ctx.strokeRect(-wheelLength / 2, wheelBase / 2 - wheelWidth / 2, wheelLength, wheelWidth)

    // Robot Main Body
    const bodyRadius = 12 * scale
    ctx.fillStyle = isDragging && dragModeRef.current === 'robot' ? '#0f172a' : '#1e293b'
    ctx.strokeStyle = robotColor
    ctx.lineWidth = 2.5

    ctx.beginPath()
    ctx.roundRect(-robotLength / 2, -robotWidth / 2, robotLength, robotWidth, bodyRadius)
    ctx.fill()
    ctx.stroke()

    // Board Label Badge
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.roundRect(-robotLength * 0.25, -robotWidth * 0.25, robotLength * 0.5, robotWidth * 0.5, 4 * scale)
    ctx.fill()

    ctx.fillStyle = robotColor
    ctx.font = `bold ${Math.max(9, Math.floor(11 * scale))}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(boardType, 0, 0)

    // Front Nose Direction Indicator
    ctx.fillStyle = robotColor
    ctx.beginPath()
    ctx.moveTo(robotLength / 2 + 10 * scale, 0)
    ctx.lineTo(robotLength / 2 - 4 * scale, -10 * scale)
    ctx.lineTo(robotLength / 2 - 4 * scale, 10 * scale)
    ctx.closePath()
    ctx.fill()

    // --- SENSOR DEBUG OVERLAY & REAL-TIME SAMPLING ---
    const activeMapCtx = mapCanvasRef.current?.getContext('2d')
    const cosH = Math.cos(physicsState.heading)
    const sinH = Math.sin(physicsState.heading)

    sensors.forEach((sensor) => {
      if (!sensor.enabled) return

      // Calculate sensor world position (in map mm)
      const sensorWorldX = physicsState.x + sensor.offsetX * cosH - sensor.offsetY * sinH
      const sensorWorldY = physicsState.y + sensor.offsetX * sinH + sensor.offsetY * cosH

      // Position relative to robot chassis center in canvas space
      const sensorLocalCanvasX = sensor.offsetX * scale
      const sensorLocalCanvasY = sensor.offsetY * scale

      if (sensor.type === 'IR_LINE') {
        let isLine = false
        if (activeMapCtx && mapCanvasRef.current) {
          const sample = samplePixelColor(
            activeMapCtx,
            mapCanvasRef.current.width,
            mapCanvasRef.current.height,
            mapDef.widthMm,
            mapDef.heightMm,
            sensorWorldX,
            sensorWorldY
          )
          isLine = sample.isLine
        }

        if (showSensorsOverlay) {
          ctx.fillStyle = isLine ? '#ef4444' : '#10b981'
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(sensorLocalCanvasX, sensorLocalCanvasY, Math.max(3.5, 4.5 * scale), 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
      } else if (sensor.type === 'DISTANCE_TOF') {
        const sensorRad = physicsState.heading + (sensor.angle * Math.PI) / 180
        let distanceMm = 2000
        let hitX = sensorWorldX + Math.cos(sensorRad) * 2000
        let hitY = sensorWorldY + Math.sin(sensorRad) * 2000

        if (activeMapCtx && mapCanvasRef.current) {
          const ray = raycastDistanceTof(
            activeMapCtx,
            mapCanvasRef.current.width,
            mapCanvasRef.current.height,
            mapDef.widthMm,
            mapDef.heightMm,
            sensorWorldX,
            sensorWorldY,
            sensorRad,
            2000,
            obstacles
          )
          distanceMm = ray.distanceMm
          hitX = ray.hitX
          hitY = ray.hitY
        }

        if (showSensorsOverlay) {
          ctx.fillStyle = '#f59e0b'
          ctx.beginPath()
          ctx.arc(sensorLocalCanvasX, sensorLocalCanvasY, 4 * scale, 0, Math.PI * 2)
          ctx.fill()

          ctx.save()
          ctx.rotate(-physicsState.heading)

          const sensorCanvasWorldX = robotX + sensorLocalCanvasX * cosH - sensorLocalCanvasY * sinH
          const sensorCanvasWorldY = robotY + sensorLocalCanvasX * sinH + sensorLocalCanvasY * cosH
          const hitCanvasX = offsetX + hitX * scale
          const hitCanvasY = offsetY + hitY * scale

          ctx.strokeStyle = distanceMm < 2000 ? '#f59e0b' : '#f59e0b40'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(sensorCanvasWorldX - robotX, sensorCanvasWorldY - robotY)
          ctx.lineTo(hitCanvasX - robotX, hitCanvasY - robotY)
          ctx.stroke()
          ctx.setLineDash([])

          if (distanceMm < 2000) {
            ctx.fillStyle = '#ef4444'
            ctx.beginPath()
            ctx.arc(hitCanvasX - robotX, hitCanvasY - robotY, 4, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.restore()
        }
      }
    })

    ctx.restore()
    ctx.restore()
  }, [
    mapDef,
    physicsState,
    boardType,
    robotSpec,
    trailPath,
    showSensorsOverlay,
    showTrail,
    sensors,
    isDragging,
    isHovered,
    theme,
    obstacles,
    selectedObstacleId
  ])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      renderCanvas()
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
    }
  }, [renderCanvas])

  // Mouse / Touch Drag Position Helpers
  const isPointerOverRobot = useCallback(
    (canvasX: number, canvasY: number) => {
      const { offsetX, offsetY, scale } = transformRef.current
      const robotCanvasX = offsetX + physicsState.x * scale
      const robotCanvasY = offsetY + physicsState.y * scale
      const dist = Math.hypot(canvasX - robotCanvasX, canvasY - robotCanvasY)
      const hitRadius = Math.max(45, 120 * scale)
      return dist <= hitRadius
    },
    [physicsState.x, physicsState.y]
  )

  const findClickedObstacle = useCallback(
    (canvasX: number, canvasY: number) => {
      const { offsetX, offsetY, scale } = transformRef.current
      for (const obs of obstacles) {
        const obsCanvasX = offsetX + obs.x * scale
        const obsCanvasY = offsetY + obs.y * scale
        const obsW = obs.width * scale
        const obsH = obs.height * scale

        // Calculate local coordinates of mouse relative to obstacle center & rotation
        const dx = canvasX - obsCanvasX
        const dy = canvasY - obsCanvasY
        const rad = (-obs.rotation * Math.PI) / 180
        const localX = Math.cos(rad) * dx - Math.sin(rad) * dy
        const localY = Math.sin(rad) * dx + Math.cos(rad) * dy

        // 1. Rotate Handle Hit Check (if obstacle is currently selected)
        const isSelected = obs.id === selectedObstacleId
        if (isSelected) {
          const handleLocalX = 0
          const handleLocalY = -obsH / 2 - 20
          const distToHandle = Math.hypot(localX - handleLocalX, localY - handleLocalY)
          if (distToHandle <= 22) {
            return { obs, mode: 'rotate_obs' as const }
          }
        }

        // 2. Obstacle Body Hit Check
        if (Math.abs(localX) <= obsW / 2 + 8 && Math.abs(localY) <= obsH / 2 + 8) {
          return { obs, mode: 'obstacle' as const }
        }
      }
      return null
    },
    [obstacles, selectedObstacleId]
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    // Check click on robot
    if (isPointerOverRobot(canvasX, canvasY)) {
      isDraggingRef.current = true
      dragModeRef.current = 'robot'
      setIsDragging(true)
      container.setPointerCapture(e.pointerId)
      return
    }

    // Check click on obstacles (Body or Rotate Handle)
    const obsHit = findClickedObstacle(canvasX, canvasY)
    if (obsHit) {
      isDraggingRef.current = true
      dragModeRef.current = obsHit.mode
      draggingObsIdRef.current = obsHit.obs.id
      if (onSelectObstacle) onSelectObstacle(obsHit.obs.id)
      setIsDragging(true)
      container.setPointerCapture(e.pointerId)
      return
    }

    // Clicked outside -> deselect obstacle
    if (onSelectObstacle) onSelectObstacle(null)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    const { offsetX, offsetY, scale } = transformRef.current

    if (!isDraggingRef.current) {
      setIsHovered(isPointerOverRobot(canvasX, canvasY))
      return
    }

    const mapX = (canvasX - offsetX) / scale
    const mapY = (canvasY - offsetY) / scale

    if (dragModeRef.current === 'robot' && onRepositionRobot) {
      const margin = 80
      const clampedX = Math.max(margin, Math.min(mapDef.widthMm - margin, mapX))
      const clampedY = Math.max(margin, Math.min(mapDef.heightMm - margin, mapY))
      onRepositionRobot(clampedX, clampedY)
    } else if (dragModeRef.current === 'obstacle' && draggingObsIdRef.current && onUpdateObstacle) {
      const obs = obstacles.find((o) => o.id === draggingObsIdRef.current)
      if (obs) {
        onUpdateObstacle({ ...obs, x: mapX, y: mapY })
      }
    } else if (dragModeRef.current === 'rotate_obs' && draggingObsIdRef.current && onUpdateObstacle) {
      const obs = obstacles.find((o) => o.id === draggingObsIdRef.current)
      if (obs) {
        const obsCanvasX = offsetX + obs.x * scale
        const obsCanvasY = offsetY + obs.y * scale
        const angleRad = Math.atan2(canvasY - obsCanvasY, canvasX - obsCanvasX)
        let angleDeg = Math.round((angleRad * 180) / Math.PI) + 90
        if (angleDeg < 0) angleDeg += 360
        onUpdateObstacle({ ...obs, rotation: angleDeg })
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      dragModeRef.current = null
      draggingObsIdRef.current = null
      setIsDragging(false)
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
      className={`w-full h-full relative overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center touch-none ${
        isDragging ? 'cursor-grabbing' : isHovered ? 'cursor-grab' : 'cursor-default'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {isHovered && !isDragging && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-500/30 pointer-events-none shadow-lg animate-pulse font-mono">
          Click & Drag to reposition robot 🖱️
        </div>
      )}
    </div>
  )
}
