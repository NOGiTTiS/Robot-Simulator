// Sensor Pixel Color Sampling & TOF Distance Raycaster Engine

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

export function raycastDistanceTof(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  mapWidthMm: number,
  mapHeightMm: number,
  startXMm: number,
  startYMm: number,
  angleRad: number,
  maxDistanceMm = 2000
): { distanceMm: number; hitX: number; hitY: number } {
  const stepMm = 10
  let distance = 0

  while (distance < maxDistanceMm) {
    const curX = startXMm + Math.cos(angleRad) * distance
    const curY = startYMm + Math.sin(angleRad) * distance

    if (curX <= 10 || curX >= mapWidthMm - 10 || curY <= 10 || curY >= mapHeightMm - 10) {
      return { distanceMm: Math.round(distance), hitX: curX, hitY: curY }
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
