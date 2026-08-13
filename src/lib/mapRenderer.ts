import { MapDefinition } from '@/types/project'

export interface RenderedMapCanvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

// Draw crisp built-in maps procedurally to offscreen canvas
export function generateBuiltinMapCanvas(mapDef: MapDefinition, widthPx = 2400): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const scale = widthPx / mapDef.widthMm
  const heightPx = Math.round(mapDef.heightMm * scale)
  canvas.width = widthPx
  canvas.height = heightPx

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // 1. Fill base white/light field mat background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, widthPx, heightPx)

  // 2. Draw border
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 12 * scale
  ctx.strokeRect(6 * scale, 6 * scale, widthPx - 12 * scale, heightPx - 12 * scale)

  const lineThick = 20 * scale // 2cm line width standard

  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#000000'
  ctx.lineWidth = lineThick
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Default line loop fallback
  ctx.beginPath()
  ctx.rect(200 * scale, 200 * scale, widthPx - 400 * scale, heightPx - 400 * scale)
  ctx.stroke()

  return canvas
}
