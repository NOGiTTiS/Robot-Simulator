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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans select-none">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                สตูดิโอวาดสนามแข่งขัน (Interactive Map Painter)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                วาดเส้นสนาม สี่เหลี่ยม วงกลม และกำหนดจุดเกิดหุ่นยนต์ได้อย่างอิสระ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Control Sidebar */}
          <div className="w-full md:w-80 p-5 space-y-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-50/60 dark:bg-slate-950/60">
            {/* Map Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ชื่อสนามแข่งขัน</label>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 transition-all font-sans"
              />
            </div>

            {/* Field Dimensions */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">กว้าง (ซม.)</label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">ยาว (ซม.)</label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Drawing Tools Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">เครื่องมือวาดภาพ</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveTool('pen')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    activeTool === 'pen'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-900/20 border-brand-500'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title="พู่กันวาดเส้นอิสระ"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-[10px]">เส้นอิสระ</span>
                </button>

                <button
                  onClick={() => setActiveTool('line')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    activeTool === 'line'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-900/20 border-brand-500'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title="วาดเส้นตรง"
                >
                  <Minus className="w-4 h-4" />
                  <span className="text-[10px]">เส้นตรง</span>
                </button>

                <button
                  onClick={() => setActiveTool('rect')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    activeTool === 'rect'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-900/20 border-brand-500'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title="วาดสี่เหลี่ยม"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-[10px]">สี่เหลี่ยม</span>
                </button>

                <button
                  onClick={() => setActiveTool('circle')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    activeTool === 'circle'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-900/20 border-brand-500'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title="วาดวงกลม"
                >
                  <Circle className="w-4 h-4" />
                  <span className="text-[10px]">วงกลม</span>
                </button>

                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    activeTool === 'eraser'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20 border-amber-500'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title="ยางลบ"
                >
                  <Eraser className="w-4 h-4" />
                  <span className="text-[10px]">ยางลบ</span>
                </button>

                <button
                  onClick={() => setActiveTool('spawn')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    activeTool === 'spawn'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/20 border-emerald-500'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                  title="กำหนดจุดวางหุ่นยนต์"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px]">จุดเริ่มต้น</span>
                </button>
              </div>
            </div>

            {/* Stroke Width Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">ขนาดเส้น</span>
                <span className="font-mono text-brand-600 dark:text-brand-300 font-bold">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="80"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>4px</span>
                <span className="text-brand-600 dark:text-brand-300 font-semibold">20px (มาตรฐาน 2 ซม.)</span>
                <span>80px</span>
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Palette className="w-4 h-4 text-brand-500" />
                <span>จานสี</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setStrokeColor(c.value)
                      if (activeTool === 'eraser') setActiveTool('pen')
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                      strokeColor === c.value && activeTool !== 'eraser'
                        ? 'border-brand-500 bg-brand-50 dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="truncate">{c.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Robot Spawn Position Coordinates */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
                <span>พิกัดจุดวางหุ่นยนต์</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Start X (มม.)</label>
                  <input
                    type="number"
                    value={startX}
                    onChange={(e) => setStartX(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Start Y (มม.)</label>
                  <input
                    type="number"
                    value={startY}
                    onChange={(e) => setStartY(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">มุมมุ่งหน้า (องศา)</label>
                  <input
                    type="number"
                    value={startHeading}
                    onChange={(e) => setStartHeading(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Drawing Canvas Workspace */}
          <div className="flex-1 bg-slate-100/60 dark:bg-slate-950 p-5 flex flex-col items-center justify-between overflow-hidden relative">
            {/* Top Canvas Action Bar */}
            <div className="w-full flex items-center justify-between gap-2 mb-3 bg-white dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
                  title="ย้อนกลับ"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ย้อนกลับ</span>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
                  title="ทำซ้ำ"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>ทำซ้ำ</span>
                </button>
              </div>

              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                ขนาดสนาม: {widthCm} × {heightCm} ซม.
              </div>

              <button
                onClick={handleClearCanvas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-all shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างกระดาน</span>
              </button>
            </div>

            {/* Drawing Canvas Area */}
            <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden p-2">
              <div className="relative shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700/80 bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="block cursor-crosshair"
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
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shadow-lg ring-2 ring-white">
                    S
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom Actions */}
            <div className="w-full pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                คำแนะนำ: เลือกเครื่องมือ &quot;จุดเริ่มต้น&quot; แล้วคลิกบนกระดานเพื่อกำหนดจุดเกิดหุ่นยนต์
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleSaveMap}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-brand-900/20 active:scale-95"
                >
                  <Check className="w-4 h-4" /> บันทึกและนำไปใช้งาน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
