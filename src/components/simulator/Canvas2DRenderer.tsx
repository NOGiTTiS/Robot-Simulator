'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ExtendedPhysicsState } from '@/lib/physics/kinematics'
import { MapDefinition, SensorConfigItem, RobotSpec } from '@/types/project'
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
  onRepositionRobot
}: Canvas2DRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const customImgRef = useRef<HTMLImageElement | null>(null)

  const isDraggingRef = useRef<boolean>(false)
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
    ctx.fillStyle = '#020617' // Slate 950
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

    // --- ROBOT CHASSIS & SENSOR SAMPLING ---
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
    if (isDragging || isHovered) {
      ctx.strokeStyle = isDragging ? robotColor : `${robotColor}80`
      ctx.lineWidth = isDragging ? 3 : 2
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.arc(0, 0, robotLength * 0.8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = isDragging ? `${robotColor}33` : `${robotColor}1a`
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
    ctx.fillStyle = isDragging ? '#0f172a' : '#1e293b'
    ctx.strokeStyle = isDragging ? robotColor : robotColor
    ctx.lineWidth = isDragging ? 3 : 2.5

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
        let grayscale = 1000
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
          grayscale = sample.grayscale
          isLine = sample.isLine
        }

        // Update hardware state for C++ interpreter
        if (hwState) {
          hwState.analogPins[sensor.pin] = grayscale
          hwState.digitalPins[sensor.pin] = isLine ? 1 : 0
        }

        if (showSensorsOverlay) {
          // Render IR Sensor Dot (Green if line, Red if floor)
          ctx.fillStyle = isLine ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.arc(sensorLocalCanvasX, sensorLocalCanvasY, 4 * scale, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          ctx.stroke()

          // Glowing halo
          ctx.fillStyle = isLine ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
          ctx.beginPath()
          ctx.arc(sensorLocalCanvasX, sensorLocalCanvasY, 7 * scale, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (sensor.type === 'DISTANCE_TOF') {
        const sensorRad = physicsState.heading + (sensor.angle * Math.PI) / 180
        let distanceMm = 2000
        let hitWorldX = sensorWorldX + Math.cos(sensorRad) * 2000
        let hitWorldY = sensorWorldY + Math.sin(sensorRad) * 2000

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
            2000
          )
          distanceMm = ray.distanceMm
          hitWorldX = ray.hitX
          hitWorldY = ray.hitY
        }

        const distanceCm = Math.round(distanceMm / 10)
        if (hwState) {
          hwState.analogPins[sensor.pin] = distanceCm
        }

        if (showSensorsOverlay) {
          // Render TOF Laser Ray Beam (Cyan)
          const hitLocalX = (hitWorldX - physicsState.x) * cosH + (hitWorldY - physicsState.y) * sinH
          const hitLocalY = -(hitWorldX - physicsState.x) * sinH + (hitWorldY - physicsState.y) * cosH

          ctx.strokeStyle = '#06b6d4'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 2])
          ctx.beginPath()
          ctx.moveTo(sensorLocalCanvasX, sensorLocalCanvasY)
          ctx.lineTo(hitLocalX * scale, hitLocalY * scale)
          ctx.stroke()
          ctx.setLineDash([])

          // Laser Hit Dot
          ctx.fillStyle = '#38bdf8'
          ctx.beginPath()
          ctx.arc(hitLocalX * scale, hitLocalY * scale, 3 * scale, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (sensor.type === 'GYRO_IMU') {
        const headingDeg = Math.round((physicsState.heading * 180) / Math.PI)
        if (hwState) {
          hwState.analogPins[sensor.pin] = headingDeg
        }

        if (showSensorsOverlay) {
          // Compass Ring Overlay around chassis
          ctx.strokeStyle = '#a855f780' // Purple opacity
          ctx.lineWidth = 1
          ctx.setLineDash([2, 2])
          ctx.beginPath()
          ctx.arc(0, 0, robotLength * 0.6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    })

    ctx.restore()
    ctx.restore()
  }, [physicsState, mapDef, boardType, trailPath, sensors, hwState, isHovered, isDragging])

  // Main 2D Render Loop & ResizeObserver
  useEffect(() => {
    renderCanvas()

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

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top
    setIsHovered(isPointerOverRobot(canvasX, canvasY))
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    if (!isPointerOverRobot(canvasX, canvasY)) return

    isDraggingRef.current = true
    setIsDragging(true)
    container.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !onRepositionRobot || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    const { offsetX, offsetY, scale } = transformRef.current
    const mapX = (canvasX - offsetX) / scale
    const mapY = (canvasY - offsetY) / scale

    const margin = 80
    const clampedX = Math.max(margin, Math.min(mapDef.widthMm - margin, mapX))
    const clampedY = Math.max(margin, Math.min(mapDef.heightMm - margin, mapY))

    onRepositionRobot(clampedX, clampedY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
      if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center touch-none ${
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

