'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Pencil,
  Minus,
  Square,
  Circle,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  MapPin,
  Check,
  X,
  Palette,
  Maximize2,
  Paintbrush
} from 'lucide-react'
import { MapDefinition } from '@/types/project'

interface MapDrawerModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMap: (newMap: MapDefinition) => void
}

type ToolType = 'pen' | 'line' | 'rect' | 'circle' | 'eraser' | 'spawn'

export function MapDrawerModal({ isOpen, onClose, onAddMap }: MapDrawerModalProps) {
  const [mapName, setMapName] = useState('สนามวาดเอง')
  const [widthCm, setWidthCm] = useState(240)
  const [heightCm, setHeightCm] = useState(120)
  const [startX, setStartX] = useState(1200)
  const [startY, setStartY] = useState(600)
  const [startHeading, setStartHeading] = useState(0)

  const [activeTool, setActiveTool] = useState<ToolType>('pen')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(20)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef<boolean>(false)
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const snapshotRef = useRef<ImageData | null>(null)

  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)

  // Quick preset colors
  const presetColors = [
    { label: 'Black (Line)', value: '#000000' },
    { label: 'White (Mat)', value: '#ffffff' },
    { label: 'Green (Start)', value: '#22c55e' },
    { label: 'Red (Finish)', value: '#ef4444' },
    { label: 'Blue (Obstacle)', value: '#3b82f6' },
    { label: 'Yellow (Mark)', value: '#eab308' }
  ]

  // Initialize Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = 1200
    canvas.height = Math.round(1200 * (heightCm / widthCm))

    // Fill White Mat Floor
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Outer Border
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

    // Save Initial History State
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([initialData])
    setHistoryIndex(0)
  }, [widthCm, heightCm])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        initCanvas()
      }, 50)
    }
  }, [isOpen, initCanvas])

  if (!isOpen) return null

  // Push Canvas State to History Stack
  const pushHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const prevIndex = historyIndex - 1
    ctx.putImageData(history[prevIndex], 0, 0)
    setHistoryIndex(prevIndex)
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const nextIndex = historyIndex + 1
    ctx.putImageData(history[nextIndex], 0, 0)
    setHistoryIndex(nextIndex)
  }

  // Clear Canvas
  const handleClearCanvas = () => {
    if (confirm('คุณต้องการล้างภาพวาดสนามทั้งหมดใช่หรือไม่?')) {
      initCanvas()
    }
  }

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Mouse Handlers for Drawing Tools
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    if (activeTool === 'spawn') {
      // Set Start Spawn Position (mm)
      const ratioX = coords.x / canvas.width
      const ratioY = coords.y / canvas.height
      const newX = Math.round(ratioX * widthCm * 10)
      const newY = Math.round(ratioY * heightCm * 10)
      setStartX(newX)
      setStartY(newY)
      return
    }

    isDrawingRef.current = true
    startPosRef.current = coords
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : strokeColor
    ctx.fillStyle = activeTool === 'eraser' ? '#ffffff' : strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (activeTool === 'pen' || activeTool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const coords = getCanvasCoords(e)
    const startPos = startPosRef.current

    if (activeTool === 'pen' || activeTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
    } else if (snapshotRef.current) {
      // Restore Snapshot for Shape Preview
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.strokeStyle = strokeColor
      ctx.fillStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (activeTool === 'line') {
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(coords.x, coords.y)
        ctx.stroke()
      } else if (activeTool === 'rect') {
        const w = coords.x - startPos.x
        const h = coords.y - startPos.y
        ctx.strokeRect(startPos.x, startPos.y, w, h)
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.x, coords.y - startPos.y)
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    pushHistory()
  }

  // Save Drawn Map to Project
  const handleSaveMap = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const titleToUse = mapName.trim() || 'สนามวาดเอง'

    const newMap: MapDefinition = {
      id: `custom-draw-${Date.now()}`,
      name: `${titleToUse} (${widthCm}x${heightCm}cm)`,
      imageUrl: dataUrl,
      widthMm: widthCm * 10,
      heightMm: heightCm * 10,
      startX: startX,
      startY: startY,
      startHeading: startHeading,
      isCustom: true
    }

    onAddMap(newMap)
    onClose()
  }

  // Spawn Indicator Relative Position (%)
  const spawnLeftPercent = ((startX / (widthCm * 10)) * 100).toFixed(1)
  const spawnTopPercent = ((startY / (heightCm * 10)) * 100).toFixed(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-5xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                เครื่องมือวาดสนามแข่งขัน (Interactive Map Designer)
              </h2>
              <p className="text-xs text-slate-400">
                วาดเส้นทาง จุดเริ่มต้น-จุดสิ้นสุด และสร้างสนามแข่งขันในรูปแบบของคุณเอง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Toolbar Side Panel */}
          <div className="w-full lg:w-72 bg-slate-950/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto custom-scrollbar shrink-0">
            {/* Map Title Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อสนาม</label>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Field Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">กว้าง (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">ยาว (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Drawing Tools Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">เครื่องมือวาด (Tools)</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setActiveTool('pen')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
                    activeTool === 'pen'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                  title="พู่กันวาดเส้นอิสระ"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-[10px]">เส้นอิสระ</span>
                </button>

                <button
                  onClick={() => setActiveTool('line')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
                    activeTool === 'line'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                  title="วาดเส้นตรง"
                >
                  <Minus className="w-4 h-4" />
                  <span className="text-[10px]">เส้นตรง</span>
                </button>

                <button
                  onClick={() => setActiveTool('rect')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
                    activeTool === 'rect'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                  title="วาดสี่เหลี่ยม"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-[10px]">สี่เหลี่ยม</span>
                </button>

                <button
                  onClick={() => setActiveTool('circle')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
                    activeTool === 'circle'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                  title="วาดวงกลม"
                >
                  <Circle className="w-4 h-4" />
                  <span className="text-[10px]">วงกลม</span>
                </button>

                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
                    activeTool === 'eraser'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                  title="ยางลบ"
                >
                  <Eraser className="w-4 h-4" />
                  <span className="text-[10px]">ยางลบ</span>
                </button>

                <button
                  onClick={() => setActiveTool('spawn')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition ${
                    activeTool === 'spawn'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  }`}
                  title="กำหนดจุดวางหุ่นยนต์"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px]">จุดเริ่มต้น</span>
                </button>
              </div>
            </div>

            {/* Stroke Width Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">ขนาดเส้น (Line Width)</span>
                <span className="font-mono text-cyan-400">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="80"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>4px</span>
                <span className="text-cyan-400 font-semibold">20px (มาตรฐาน 2cm)</span>
                <span>80px</span>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>จานสี (Colors)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {presetColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setStrokeColor(c.value)
                      if (activeTool === 'eraser') setActiveTool('pen')
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-medium transition ${
                      strokeColor === c.value && activeTool !== 'eraser'
                        ? 'border-cyan-400 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="truncate">{c.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Robot Spawn Position Coordinates */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>พิกัดจุดวางหุ่นยนต์</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="block text-[10px] text-slate-400">Start X (mm)</label>
                  <input
                    type="number"
                    value={startX}
                    onChange={(e) => setStartX(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Start Y (mm)</label>
                  <input
                    type="number"
                    value={startY}
                    onChange={(e) => setStartY(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Heading (deg)</label>
                  <input
                    type="number"
                    value={startHeading}
                    onChange={(e) => setStartHeading(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Drawing Canvas Workspace */}
          <div className="flex-1 bg-slate-950 p-4 flex flex-col items-center justify-between overflow-hidden relative">
            {/* Top Canvas Action Bar */}
            <div className="w-full flex items-center justify-between gap-2 mb-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 transition"
                  title="Undo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ย้อนกลับ</span>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 transition"
                  title="Redo"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>ทำซ้ำ</span>
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400">
                ขนาดสนาม: {widthCm} × {heightCm} cm
              </div>

              <button
                onClick={handleClearCanvas}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างกระดาน</span>
              </button>
            </div>

            {/* Drawing Canvas Area */}
            <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden p-2">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-slate-700/80 bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`block cursor-${
                    activeTool === 'eraser'
                      ? 'cell'
                      : activeTool === 'spawn'
                      ? 'crosshair'
                      : 'crosshair'
                  }`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    objectFit: 'contain'
                  }}
                />

                {/* Robot Spawn Marker Overlay */}
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all"
                  style={{
                    left: `${spawnLeftPercent}%`,
                    top: `${spawnTopPercent}%`
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center animate-ping absolute" />
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg ring-2 ring-white">
                    S
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom Actions */}
            <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                เคล็ดลับ: ใช้เครื่องมือ &quot;จุดเริ่มต้น&quot; เพื่อคลิกเลือกจุดวางหุ่นยนต์บนสนาม
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleSaveMap}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4" /> บันทึกและนำไปใช้
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
