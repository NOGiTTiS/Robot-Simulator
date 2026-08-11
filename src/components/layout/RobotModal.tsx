'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  Bot,
  Sliders,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  Cpu,
  Zap,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Shield,
  RotateCw
} from 'lucide-react'
import { RobotSpec } from '@/types/project'
import { BUILTIN_ROBOT_PRESETS, DEFAULT_ROBOT_SPEC } from '@/lib/robots'

interface RobotModalProps {
  isOpen: boolean
  onClose: () => void
  activeRobot: RobotSpec
  onSelectRobot: (robot: RobotSpec) => void
  customRobots: RobotSpec[]
  onSaveCustomRobot: (robot: RobotSpec) => void
  onDeleteCustomRobot: (robotId: string) => void
  onOpenSensorModal: () => void
}

const COLOR_PALETTES = [
  { name: 'Cyan Tech', value: '#06b6d4' },
  { name: 'Amber Gold', value: '#f59e0b' },
  { name: 'Emerald Speed', value: '#10b981' },
  { name: 'Indigo Core', value: '#6366f1' },
  { name: 'Rose Cyber', value: '#f43f5e' },
  { name: 'Purple Void', value: '#a855f7' },
  { name: 'Crimson Power', value: '#dc2626' },
  { name: 'Dark Steel', value: '#475569' }
]

export function RobotModal({
  isOpen,
  onClose,
  activeRobot,
  onSelectRobot,
  customRobots,
  onSaveCustomRobot,
  onDeleteCustomRobot,
  onOpenSensorModal
}: RobotModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'customizer'>('presets')

  // Form State for Customizer
  const [editRobot, setEditRobot] = useState<RobotSpec>(activeRobot)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (activeRobot) {
      setEditRobot(activeRobot)
    }
  }, [activeRobot, isOpen])

  // Live 2D Robot Preview Renderer inside Modal
  useEffect(() => {
    if (!isOpen) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    canvas.width = width * dpr
    canvas.height = height * dpr

    ctx.save()
    ctx.scale(dpr, dpr)

    // Clear background
    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, width, height)

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    const gridSize = 20
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Center origin
    const centerX = width / 2
    const centerY = height / 2

    // Scale factor (pixel per mm)
    const previewScale = Math.min(width / 320, height / 320)

    const bodyW = editRobot.bodyWidth * previewScale
    const bodyL = editRobot.bodyLength * previewScale
    const wheelB = editRobot.wheelBase * previewScale
    const wheelR = editRobot.wheelRadius * previewScale

    ctx.save()
    ctx.translate(centerX, centerY)

    // Left & Right Wheels
    const wheelWidth = 14 * previewScale
    const wheelLength = wheelR * 2

    ctx.fillStyle = '#0f172a'
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5

    // Left wheel
    ctx.fillRect(-wheelLength / 2, -wheelB / 2 - wheelWidth / 2, wheelLength, wheelWidth)
    ctx.strokeRect(-wheelLength / 2, -wheelB / 2 - wheelWidth / 2, wheelLength, wheelWidth)

    // Right wheel
    ctx.fillRect(-wheelLength / 2, wheelB / 2 - wheelWidth / 2, wheelLength, wheelWidth)
    ctx.strokeRect(-wheelLength / 2, wheelB / 2 - wheelWidth / 2, wheelLength, wheelWidth)

    // Main Body Chassis
    ctx.fillStyle = '#0f172a'
    ctx.strokeStyle = editRobot.color || '#06b6d4'
    ctx.lineWidth = 3

    const radius = 10 * previewScale
    ctx.beginPath()
    ctx.roundRect(-bodyL / 2, -bodyW / 2, bodyL, bodyW, radius)
    ctx.fill()
    ctx.stroke()

    // Inner Glow
    ctx.fillStyle = `${editRobot.color || '#06b6d4'}22`
    ctx.fill()

    // Board Badge
    ctx.fillStyle = '#1e293b'
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(-bodyL * 0.25, -bodyW * 0.25, bodyL * 0.5, bodyW * 0.5, 4)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = editRobot.color || '#06b6d4'
    ctx.font = `bold ${Math.max(10, Math.floor(11 * previewScale))}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(editRobot.boardType, 0, 0)

    // Front Arrow / Nose
    ctx.fillStyle = editRobot.color || '#06b6d4'
    ctx.beginPath()
    ctx.moveTo(bodyL / 2 + 10 * previewScale, 0)
    ctx.lineTo(bodyL / 2 - 4 * previewScale, -8 * previewScale)
    ctx.lineTo(bodyL / 2 - 4 * previewScale, 8 * previewScale)
    ctx.closePath()
    ctx.fill()

    // Dimension Annotations
    ctx.strokeStyle = '#475569'
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px monospace'

    // Width label
    ctx.beginPath()
    ctx.moveTo(-bodyL / 2 - 12, -bodyW / 2)
    ctx.lineTo(-bodyL / 2 - 12, bodyW / 2)
    ctx.stroke()

    ctx.save()
    ctx.translate(-bodyL / 2 - 16, 0)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText(`${editRobot.bodyWidth}mm`, 0, 0)
    ctx.restore()

    // Length label
    ctx.beginPath()
    ctx.moveTo(-bodyL / 2, bodyW / 2 + 12)
    ctx.lineTo(bodyL / 2, bodyW / 2 + 12)
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillText(`${editRobot.bodyLength}mm`, 0, bodyW / 2 + 24)

    ctx.restore()
    ctx.restore()
  }, [editRobot, isOpen])

  if (!isOpen) return null

  const allPresets = [...BUILTIN_ROBOT_PRESETS, ...customRobots]

  const handleApplyRobot = (robot: RobotSpec) => {
    onSelectRobot(robot)
    onClose()
  }

  const handleSaveAsCustom = () => {
    const newId = `custom-bot-${Date.now()}`
    const customSpec: RobotSpec = {
      ...editRobot,
      id: editRobot.isCustom ? editRobot.id : newId,
      name: editRobot.name.trim() || 'Custom Robot',
      isCustom: true,
      presetType: 'custom'
    }
    onSaveCustomRobot(customSpec)
    onSelectRobot(customSpec)
    setActiveTab('presets')
  }

  const handleExportRobotJson = (robot: RobotSpec) => {
    const blob = new Blob([JSON.stringify(robot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${robot.name.toLowerCase().replace(/\s+/g, '_')}_spec.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportRobotJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string) as RobotSpec
            if (parsed && parsed.bodyWidth && parsed.boardType) {
              const newRobot: RobotSpec = {
                ...parsed,
                id: `imported-bot-${Date.now()}`,
                isCustom: true,
                presetType: 'custom'
              }
              onSaveCustomRobot(newRobot)
              onSelectRobot(newRobot)
              setEditRobot(newRobot)
            }
          } catch (err) {
            console.error('Invalid robot JSON file', err)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                จัดการหุ่นยนต์ (Robot Management)
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-medium">
                  {activeRobot.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                เลือกพรีเซ็ตสำเร็จรูป หรือปรับแต่งโครงสร้าง มอเตอร์ สี และฟิสิกส์ตัวถังหุ่นยนต์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportRobotJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition flex items-center gap-1.5"
              title="Import Robot Spec (.json)"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import Spec</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'presets'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>พรีเซ็ตหุ่นยนต์ ({allPresets.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('customizer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'customizer'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>ปรับแต่งโครงสร้าง & ฟิสิกส์</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose()
              onOpenSensorModal()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ไปที่ตั้งค่าเซนเซอร์ (Sensors) &rarr;</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'presets' ? (
            <div className="space-y-6">
              {/* Built-in Presets Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>พรีเซ็ตหุ่นยนต์มาตรฐาน (Built-in Robot Presets)</span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditRobot({
                        id: `custom-${Date.now()}`,
                        name: 'My Custom Robot',
                        boardType: 'ATOM-VX',
                        bodyWidth: 150,
                        bodyLength: 170,
                        wheelBase: 150,
                        wheelRadius: 32,
                        maxSpeed: 700,
                        accelRate: 2000,
                        decelRate: 2600,
                        frictionCoeff: 0.9,
                        color: '#06b6d4',
                        presetType: 'custom',
                        isCustom: true
                      })
                      setActiveTab('customizer')
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition shadow-md shadow-cyan-950/40"
                  >
                    <Plus className="w-4 h-4" />
                    <span>สร้างหุ่นยนต์ใหม่ (New Custom Bot)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPresets.map((r) => {
                    const isActive = activeRobot.id === r.id
                    return (
                      <div
                        key={r.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: r.color || '#06b6d4' }}
                              />
                              <h4 className="font-bold text-sm text-slate-200">{r.name}</h4>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                                {r.boardType}
                              </span>
                              {r.isCustom && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                                  Custom
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                            {r.description || 'หุ่นยนต์ปรับแต่งเฉพาะกิจ'}
                          </p>

                          {/* Robot Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                              <div className="text-slate-500 text-[10px]">ขนาดตัวถัง</div>
                              <div className="text-slate-200 font-semibold mt-0.5">
                                {r.bodyWidth}x{r.bodyLength} <span className="text-[9px] text-slate-500">mm</span>
                              </div>
                            </div>
                            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                              <div className="text-slate-500 text-[10px]">ความเร็วสูงสุด</div>
                              <div className="text-amber-300 font-semibold mt-0.5">
                                {(r.maxSpeed / 10).toFixed(0)} <span className="text-[9px] text-slate-500">cm/s</span>
                              </div>
                            </div>
                            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                              <div className="text-slate-500 text-[10px]">การยึดเกาะ</div>
                              <div className="text-emerald-400 font-semibold mt-0.5">
                                {Math.round(r.frictionCoeff * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditRobot(r)
                                setActiveTab('customizer')
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                            >
                              แก้ไข / ปรับแต่ง
                            </button>
                            <button
                              onClick={() => handleExportRobotJson(r)}
                              title="Export Spec JSON"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {r.isCustom && (
                              <button
                                onClick={() => onDeleteCustomRobot(r.id)}
                                title="ลบหุ่นยนต์นี้"
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 transition border border-rose-800/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => handleApplyRobot(r)}
                            disabled={isActive}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>กำลังใช้งานอยู่</span>
                              </>
                            ) : (
                              <span>เลือกใช้งานหุ่นยนต์นี้</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Customizer Tab */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Controls Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. General Info */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>ข้อมูลทั่วไป & บอร์ดไมโครคอนโทรลเลอร์</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">ชื่อหุ่นยนต์ (Robot Name)</label>
                      <input
                        type="text"
                        value={editRobot.name}
                        onChange={(e) => setEditRobot({ ...editRobot, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        placeholder="ตั้งชื่อหุ่นยนต์..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">บอร์ดประมวลผล (Board Type)</label>
                      <select
                        value={editRobot.boardType}
                        onChange={(e) =>
                          setEditRobot({
                            ...editRobot,
                            boardType: e.target.value as RobotSpec['boardType']
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                      >
                        <option value="ATOM-VX">PT-BOT ATOM-VX</option>
                        <option value="POP32i">POP32 / POP32i</option>
                        <option value="NANO">Arduino Nano</option>
                        <option value="ESP32">ESP32 Board</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">ธีมสีตัวถัง (Robot Color Theme)</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_PALETTES.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setEditRobot({ ...editRobot, color: c.value })}
                          className={`w-7 h-7 rounded-lg transition-transform ${
                            editRobot.color === c.value
                              ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Chassis & Wheel Dimensions */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4" />
                    <span>มิติและขนาดตัวถัง (Chassis & Wheels)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">ความกว้างตัวถัง (Width)</span>
                        <span className="text-cyan-400 font-mono font-semibold">{editRobot.bodyWidth} mm</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="300"
                        step="5"
                        value={editRobot.bodyWidth}
                        onChange={(e) => setEditRobot({ ...editRobot, bodyWidth: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">ความยาวตัวถัง (Length)</span>
                        <span className="text-cyan-400 font-mono font-semibold">{editRobot.bodyLength} mm</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="300"
                        step="5"
                        value={editRobot.bodyLength}
                        onChange={(e) => setEditRobot({ ...editRobot, bodyLength: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">ระยะห่างระหว่างล้อ (Wheel Base)</span>
                        <span className="text-indigo-400 font-mono font-semibold">{editRobot.wheelBase} mm</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="260"
                        step="5"
                        value={editRobot.wheelBase}
                        onChange={(e) => setEditRobot({ ...editRobot, wheelBase: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">รัศมีล้อ (Wheel Radius)</span>
                        <span className="text-indigo-400 font-mono font-semibold">{editRobot.wheelRadius} mm</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="1"
                        value={editRobot.wheelRadius}
                        onChange={(e) => setEditRobot({ ...editRobot, wheelRadius: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Motor & Physics Performance */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-4 h-4" />
                    <span>สมรรถนะมอเตอร์ & ฟิสิกส์ (Motor & Friction)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">ความเร็วสูงสุด (Top Speed)</span>
                        <span className="text-amber-400 font-mono font-semibold">
                          {(editRobot.maxSpeed / 10).toFixed(0)} cm/s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="1500"
                        step="50"
                        value={editRobot.maxSpeed}
                        onChange={(e) => setEditRobot({ ...editRobot, maxSpeed: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">แรงเสียดทานล้อ (Traction)</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          {Math.round(editRobot.frictionCoeff * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.02"
                        value={editRobot.frictionCoeff}
                        onChange={(e) => setEditRobot({ ...editRobot, frictionCoeff: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">อัตราการเร่ง (Accel Ramping)</span>
                        <span className="text-slate-300 font-mono font-semibold">{editRobot.accelRate} mm/s²</span>
                      </div>
                      <input
                        type="range"
                        min="600"
                        max="5000"
                        step="100"
                        value={editRobot.accelRate}
                        onChange={(e) => setEditRobot({ ...editRobot, accelRate: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-slate-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">อัตราการเบรก (Decel Ramping)</span>
                        <span className="text-slate-300 font-mono font-semibold">{editRobot.decelRate} mm/s²</span>
                      </div>
                      <input
                        type="range"
                        min="800"
                        max="6000"
                        step="100"
                        value={editRobot.decelRate}
                        onChange={(e) => setEditRobot({ ...editRobot, decelRate: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive 2D Canvas Preview & Apply Actions */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>ตัวอย่างหุ่นยนต์ Real-time 2D</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Live Scale Preview</span>
                  </div>

                  {/* 2D Canvas Viewport */}
                  <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden relative">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                  </div>

                  {/* Spec Summary Card */}
                  <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chassis Ratio:</span>
                      <span className="text-slate-200">
                        {(editRobot.bodyWidth / editRobot.bodyLength).toFixed(2)} (W/L)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est 0-60 cm/s Time:</span>
                      <span className="text-cyan-400">
                        {(600 / editRobot.accelRate).toFixed(2)} s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Turning Speed:</span>
                      <span className="text-amber-300">
                        {((editRobot.maxSpeed * 2) / editRobot.wheelBase).toFixed(1)} rad/s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar for Customizer */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAsCustom}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
                  >
                    บันทึกเป็นหุ่นยนต์ของฉัน 💾
                  </button>

                  <button
                    onClick={() => handleApplyRobot(editRobot)}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-950/40"
                  >
                    นำไปใช้งานทันที 🚀
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
