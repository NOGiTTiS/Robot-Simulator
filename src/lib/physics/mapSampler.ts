import { useEffect, useRef } from 'react'
import { ExtendedPhysicsState } from './kinematics'
import { MapDefinition, SensorConfigItem } from '@/types/project'
import { ObstacleItem } from '@/types/obstacle'
import { HardwareState } from '@/lib/interpreter/boards'
import { generateBuiltinMapCanvas } from '@/lib/mapRenderer'

export interface PixelSampleResult {
  r: number
  g: number
  b: number
  a: number
  grayscale: number // 0 (Pure Black line) to 1000 (Pure White floor)
  isLine: boolean
}

export function samplePixelColor(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  mapWidthMm: number,
  mapHeightMm: number,
  xMm: number,
  yMm: number
): PixelSampleResult {
  // Out of map bounds check
  if (xMm < 0 || xMm > mapWidthMm || yMm < 0 || yMm > mapHeightMm) {
    return { r: 0, g: 0, b: 0, a: 255, grayscale: 0, isLine: true }
  }

  const px = Math.floor((xMm / mapWidthMm) * canvasWidth)
  const py = Math.floor((yMm / mapHeightMm) * canvasHeight)

  const safePx = Math.max(0, Math.min(canvasWidth - 1, px))
  const safePy = Math.max(0, Math.min(canvasHeight - 1, py))

  const imgData = ctx.getImageData(safePx, safePy, 1, 1).data
  const r = imgData[0]
  const g = imgData[1]
  const b = imgData[2]
  const a = imgData[3]

  // Standard luminosity formula scaled to 0-1000
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  const grayscale = Math.round((luma / 255) * 1000)

  // Black line if grayscale < 400
  const isLine = grayscale < 400

  return { r, g, b, a, grayscale, isLine }
}

export function isPointInsideObstacle(x: number, y: number, obs: ObstacleItem): boolean {
  if (obs.type === 'cylinder') {
    const dx = x - obs.x
    const dy = y - obs.y
    const radius = obs.width / 2
    return dx * dx + dy * dy <= radius * radius
  } else {
    // box or wall
    const rad = (obs.rotation * Math.PI) / 180
    const cosR = Math.cos(-rad)
    const sinR = Math.sin(-rad)

    const dx = x - obs.x
    const dy = y - obs.y

    const localX = cosR * dx - sinR * dy
    const localY = sinR * dx + cosR * dy

    return Math.abs(localX) <= obs.width / 2 && Math.abs(localY) <= obs.height / 2
  }
}

export function raycastDistanceTof(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  mapWidthMm: number,
  mapHeightMm: number,
  startXMm: number,
  startYMm: number,
  angleRad: number,
  maxDistanceMm = 2000,
  obstacles: ObstacleItem[] = []
): { distanceMm: number; hitX: number; hitY: number } {
  const stepMm = 10
  let distance = 0

  while (distance < maxDistanceMm) {
    const curX = startXMm + Math.cos(angleRad) * distance
    const curY = startYMm + Math.sin(angleRad) * distance

    if (curX <= 10 || curX >= mapWidthMm - 10 || curY <= 10 || curY >= mapHeightMm - 10) {
      return { distanceMm: Math.round(distance), hitX: curX, hitY: curY }
    }

    // Check interaction with active placement obstacles
    if (Array.isArray(obstacles) && obstacles.length > 0) {
      for (const obs of obstacles) {
        if (isPointInsideObstacle(curX, curY, obs)) {
          return { distanceMm: Math.round(distance), hitX: curX, hitY: curY }
        }
      }
    }

    const sample = samplePixelColor(ctx, canvasWidth, canvasHeight, mapWidthMm, mapHeightMm, curX, curY)
    // Dark wall obstacle (dark grey wall or dark outer wall)
    if (sample.grayscale < 200) {
      return { distanceMm: Math.round(distance), hitX: curX, hitY: curY }
    }

    distance += stepMm
  }

  return {
    distanceMm: maxDistanceMm,
    hitX: startXMm + Math.cos(angleRad) * maxDistanceMm,
    hitY: startYMm + Math.sin(angleRad) * maxDistanceMm
  }
}

export function updateHardwareSensors(
  hwState: HardwareState | undefined,
  physicsState: ExtendedPhysicsState,
  sensors: SensorConfigItem[],
  mapCtx: CanvasRenderingContext2D | null,
  mapCanvas: HTMLCanvasElement | null,
  mapDef: MapDefinition,
  obstacles: ObstacleItem[] = []
) {
  if (!hwState || !Array.isArray(sensors)) return

  const cosH = Math.cos(physicsState.heading)
  const sinH = Math.sin(physicsState.heading)

  sensors.forEach((sensor) => {
    if (!sensor.enabled) return

    const sensorWorldX = physicsState.x + sensor.offsetX * cosH - sensor.offsetY * sinH
    const sensorWorldY = physicsState.y + sensor.offsetX * sinH + sensor.offsetY * cosH

    if (sensor.type === 'IR_LINE') {
      let grayscale = 1000
      let isLine = false

      if (mapCtx && mapCanvas) {
        const sample = samplePixelColor(
          mapCtx,
          mapCanvas.width,
          mapCanvas.height,
          mapDef.widthMm,
          mapDef.heightMm,
          sensorWorldX,
          sensorWorldY
        )
        grayscale = sample.grayscale
        isLine = sample.isLine
      }

      hwState.analogPins[sensor.pin] = grayscale
      hwState.digitalPins[sensor.pin] = isLine ? 1 : 0
    } else if (sensor.type === 'DISTANCE_TOF') {
      const sensorRad = physicsState.heading + (sensor.angle * Math.PI) / 180
      let distanceMm = 2000

      if (mapCtx && mapCanvas) {
        const ray = raycastDistanceTof(
          mapCtx,
          mapCanvas.width,
          mapCanvas.height,
          mapDef.widthMm,
          mapDef.heightMm,
          sensorWorldX,
          sensorWorldY,
          sensorRad,
          2000,
          obstacles
        )
        distanceMm = ray.distanceMm
      }

      const distanceCm = Math.round(distanceMm / 10)
      hwState.analogPins[sensor.pin] = distanceCm
    } else if (sensor.type === 'GYRO_IMU') {
      const headingDeg = Math.round((physicsState.heading * 180) / Math.PI)
      hwState.analogPins[sensor.pin] = headingDeg
    }
  })
}

export function useSensorSampler(
  physicsState: ExtendedPhysicsState,
  mapDef: MapDefinition,
  sensors: SensorConfigItem[],
  hwState?: HardwareState,
  obstacles: ObstacleItem[] = []
) {
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const mapCtxRef = useRef<CanvasRenderingContext2D | null>(null)

  // Load/Generate Map Canvas Offscreen for pixel sampling
  useEffect(() => {
    if (mapDef.imageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = mapDef.imageUrl
      img.onload = () => {
        const offCanvas = document.createElement('canvas')
        offCanvas.width = 2400
        offCanvas.height = Math.round(2400 * (mapDef.heightMm / mapDef.widthMm))
        const ctx = offCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height)
          mapCanvasRef.current = offCanvas
          mapCtxRef.current = ctx
        }
      }
    } else {
      const offCanvas = generateBuiltinMapCanvas(mapDef, 2400)
      mapCanvasRef.current = offCanvas
      mapCtxRef.current = offCanvas.getContext('2d')
    }
  }, [mapDef])

  // Sample sensors on every physics update frame
  useEffect(() => {
    updateHardwareSensors(
      hwState,
      physicsState,
      sensors,
      mapCtxRef.current,
      mapCanvasRef.current,
      mapDef,
      obstacles
    )
  }, [physicsState, sensors, hwState, mapDef, obstacles])
}

