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

  switch (mapDef.id) {
    case 'athletics-280x160': {
      // Athletics Running Track & Lines
      // Start Zone (Green Box)
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(100 * scale, (mapDef.heightMm / 2 - 150) * scale, 300 * scale, 300 * scale)

      // Finish Zone (Red Box)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect((mapDef.widthMm - 400) * scale, (mapDef.heightMm / 2 - 150) * scale, 300 * scale, 300 * scale)

      // Main Loop Line Track
      ctx.beginPath()
      ctx.moveTo(350 * scale, (mapDef.heightMm / 2) * scale)
      ctx.lineTo((mapDef.widthMm - 350) * scale, (mapDef.heightMm / 2) * scale)
      ctx.stroke()

      // Oval Outer Ring
      ctx.beginPath()
      ctx.ellipse(
        (mapDef.widthMm / 2) * scale,
        (mapDef.heightMm / 2) * scale,
        (mapDef.widthMm / 2 - 300) * scale,
        (mapDef.heightMm / 2 - 250) * scale,
        0,
        0,
        Math.PI * 2
      )
      ctx.stroke()

      // Intersecting cross lines
      ctx.beginPath()
      ctx.moveTo((mapDef.widthMm / 2) * scale, 250 * scale)
      ctx.lineTo((mapDef.widthMm / 2) * scale, (mapDef.heightMm - 250) * scale)
      ctx.stroke()
      break
    }

    case 'rt-td-122x244': {
      // RT-TD Field (Grid & Junctions)
      const marginX = 200 * scale
      const marginY = 200 * scale
      const cols = 5
      const rows = 3
      const stepX = (widthPx - marginX * 2) / (cols - 1)
      const stepY = (heightPx - marginY * 2) / (rows - 1)

      // Draw Grid Lines
      for (let r = 0; r < rows; r++) {
        const y = marginY + r * stepY
        ctx.beginPath()
        ctx.moveTo(marginX, y)
        ctx.lineTo(widthPx - marginX, y)
        ctx.stroke()
      }
      for (let c = 0; c < cols; c++) {
        const x = marginX + c * stepX
        ctx.beginPath()
        ctx.moveTo(x, marginY)
        ctx.lineTo(x, heightPx - marginY)
        ctx.stroke()
      }

      // Start Square (Blue)
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(marginX - 60 * scale, marginY - 60 * scale, 120 * scale, 120 * scale)

      // Green & Red Turn Indicators at Junctions
      ctx.fillStyle = '#22c55e' // Green (Turn Left)
      ctx.beginPath()
      ctx.arc(marginX + stepX, marginY, 25 * scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ef4444' // Red (Turn Right)
      ctx.beginPath()
      ctx.arc(marginX + stepX * 3, marginY + stepY, 25 * scale, 0, Math.PI * 2)
      ctx.fill()
      break
    }

    case 'robot-120x240': {
      // Robot Field 120x240 (Circuit with T-junctions)
      const padX = 250 * scale
      const padY = 200 * scale
      const midX = widthPx / 2
      const midY = heightPx / 2

      ctx.beginPath()
      // Outer Rectangle Loop
      ctx.rect(padX, padY, widthPx - padX * 2, heightPx - padY * 2)
      // Inner cross lines
      ctx.moveTo(midX, padY)
      ctx.lineTo(midX, heightPx - padY)
      ctx.moveTo(padX, midY)
      ctx.lineTo(widthPx - padX, midY)
      ctx.stroke()

      // Start Box
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(padX - 80 * scale, midY - 80 * scale, 160 * scale, 160 * scale)
      break
    }

    case 'wall-line-track': {
      // Wall Line Track (Perimeter Wall + Line inside)
      // Outer Thick Wall Boundary (Dark Slate Wall)
      ctx.fillStyle = '#334155'
      ctx.fillRect(0, 0, widthPx, 30 * scale)
      ctx.fillRect(0, heightPx - 30 * scale, widthPx, 30 * scale)
      ctx.fillRect(0, 0, 30 * scale, heightPx)
      ctx.fillRect(widthPx - 30 * scale, 0, 30 * scale, heightPx)

      // Inner Line Track
      ctx.beginPath()
      ctx.ellipse(widthPx / 2, heightPx / 2, widthPx * 0.35, heightPx * 0.3, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Center Obstacle Wall Box
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(widthPx / 2 - 150 * scale, heightPx / 2 - 100 * scale, 300 * scale, 200 * scale)
      break
    }

    case 'qbd-field': {
      // QBD Field (Grid with numbered nodes)
      const cols = 6
      const rows = 3
      const padX = 150 * scale
      const padY = 150 * scale
      const stepX = (widthPx - padX * 2) / (cols - 1)
      const stepY = (heightPx - padY * 2) / (rows - 1)

      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        ctx.moveTo(padX, padY + r * stepY)
        ctx.lineTo(widthPx - padX, padY + r * stepY)
        ctx.stroke()
      }
      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        ctx.moveTo(padX + c * stepX, padY)
        ctx.lineTo(padX + c * stepX, heightPx - padY)
        ctx.stroke()
      }

      // Start Base
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(padX - 70 * scale, padY + stepY - 70 * scale, 140 * scale, 140 * scale)
      break
    }

    case 'line-junior': {
      // Programmable Line Junior (Smooth S-Curves & Straight Track)
      const startX = 200 * scale
      const startY = heightPx / 2

      // Start Box
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(100 * scale, heightPx / 2 - 80 * scale, 160 * scale, 160 * scale)

      // Smooth S-Curve Line Path
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(
        widthPx * 0.3,
        100 * scale,
        widthPx * 0.4,
        heightPx - 100 * scale,
        widthPx * 0.6,
        heightPx / 2
      )
      ctx.bezierCurveTo(
        widthPx * 0.75,
        100 * scale,
        widthPx * 0.85,
        heightPx - 100 * scale,
        widthPx - 200 * scale,
        heightPx / 2
      )
      ctx.stroke()

      // Stop Box
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(widthPx - 260 * scale, heightPx / 2 - 80 * scale, 160 * scale, 160 * scale)
      break
    }

    default: {
      // Default line loop
      ctx.beginPath()
      ctx.rect(200 * scale, 200 * scale, widthPx - 400 * scale, heightPx - 400 * scale)
      ctx.stroke()
      break
    }
  }

  return canvas
}
