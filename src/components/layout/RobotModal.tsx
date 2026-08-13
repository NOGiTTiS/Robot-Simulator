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
  onSelectRobot: (robot: RobotSpec, autoSyncSensors?: boolean) => void
  customRobots: RobotSpec[]
  onSaveCustomRobot: (robot: RobotSpec) => void
  onDeleteCustomRobot: (robotId: string) => void
  onOpenSensorModal: () => void
}

const COLOR_PALETTES = [
  { name: 'Brand Purple', value: '#5f06c4' },
  { name: 'Cyan Tech', value: '#06b6d4' },
  { name: 'Amber Gold', value: '#f59e0b' },
  { name: 'Emerald Speed', value: '#10b981' },
  { name: 'Indigo Core', value: '#6366f1' },
  { name: 'Rose Cyber', value: '#f43f5e' },
  { name: 'Purple Void', value: '#a855f7' },
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
  const [autoSyncSensors, setAutoSyncSensors] = useState<boolean>(true)

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

    // Clear background adaptive
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#020617' : '#f8fafc'
    ctx.fillRect(0, 0, width, height)

    // Draw Grid Lines
    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0'
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

    // Draw Robot Body at Center
    const centerX = width / 2
    const centerY = height / 2

    // Scale mm to preview px
    const scale = 1.2
    const bodyW = editRobot.bodyWidth * scale
    const bodyL = editRobot.bodyLength * scale
    const wheelR = (editRobot.wheelRadius || 32) * scale
    const wheelW = 14 * scale

    ctx.save()
    ctx.translate(centerX, centerY)

    // Wheels (Top/Bottom or Left/Right)
    ctx.fillStyle = isDark ? '#0f172a' : '#334155'
    ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8'
    ctx.lineWidth = 2

    // Left Wheel
    ctx.fillRect(-wheelR, -bodyW / 2 - wheelW / 2, wheelR * 2, wheelW)
    ctx.strokeRect(-wheelR, -bodyW / 2 - wheelW / 2, wheelR * 2, wheelW)

    // Right Wheel
    ctx.fillRect(-wheelR, bodyW / 2 - wheelW / 2, wheelR * 2, wheelW)
    ctx.strokeRect(-wheelR, bodyW / 2 - wheelW / 2, wheelR * 2, wheelW)

    // Chassis Box
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff'
    ctx.strokeStyle = editRobot.color || '#5f06c4'
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.roundRect(-bodyL / 2, -bodyW / 2, bodyL, bodyW, 12)
    ctx.fill()
    ctx.stroke()

    // Inner Accent Fill
    ctx.fillStyle = `${editRobot.color || '#5f06c4'}22`
    ctx.fill()

    // Board Chip Representation
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9'
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1'
    ctx.lineWidth = 1
    ctx.fillRect(-25, -20, 50, 40)
    ctx.strokeRect(-25, -20, 50, 40)

    // Front Direction Arrow
    ctx.fillStyle = editRobot.color || '#5f06c4'
    ctx.beginPath()
    ctx.moveTo(bodyL / 2 - 10, -10)
    ctx.lineTo(bodyL / 2 + 5, 0)
    ctx.lineTo(bodyL / 2 - 10, 10)
    ctx.closePath()
    ctx.fill()

    // Center Cross
    ctx.strokeStyle = editRobot.color || '#5f06c4'
    ctx.beginPath()
    ctx.arc(0, 0, 4, 0, Math.PI * 2)
    ctx.fill()

    // Dimension Guidelines
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8'
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'
    ctx.font = '11px sans-serif'

    // Width label
    ctx.beginPath()
    ctx.moveTo(-bodyL / 2 - 12, -bodyW / 2)
    ctx.lineTo(-bodyL / 2 - 12, bodyW / 2)
    ctx.stroke()
    ctx.textAlign = 'right'
    ctx.fillText(`${editRobot.bodyWidth}mm`, -bodyL / 2 - 16, 4)

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
    onSelectRobot(robot, autoSyncSensors)
    onClose()
  }

  const handleSaveAsCustom = () => {
    const newId = `custom-bot-${Date.now()}`
    const customSpec: RobotSpec = {
      ...editRobot,
      id: editRobot.isCustom ? editRobot.id : newId,
      name: editRobot.name.trim() || 'หุ่นยนต์ปรับแต่งเอง',
      isCustom: true,
      presetType: 'custom'
    }
    onSaveCustomRobot(customSpec)
    onSelectRobot(customSpec, autoSyncSensors)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl transition-colors duration-300">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-900/20 text-white font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                จัดการหุ่นยนต์และสเปก (Robot Manager)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800/60 font-mono font-semibold">
                  {activeRobot.name}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เลือกโมเดลสำเร็จรูป หรือปรับแต่งโครงสร้าง มอเตอร์ สี และฟิสิกส์ตัวถังหุ่นยนต์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportRobotJson}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 shadow-xs"
              title="นำเข้าสเปกหุ่นยนต์ (.json)"
            >
              <Upload className="w-4 h-4 text-brand-500" />
              <span>นำเข้าไฟล์ Spec</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'presets'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>โมเดลหุ่นยนต์สำเร็จรูป ({allPresets.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('customizer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'customizer'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>ปรับแต่งโครงสร้าง & ฟิสิกส์</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 transition-all shadow-xs">
              <input
                type="checkbox"
                checked={autoSyncSensors}
                onChange={(e) => setAutoSyncSensors(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-brand-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold select-none">
                อัปเดตเซนเซอร์เริ่มต้นอัตโนมัติ
              </span>
            </label>

            <button
              onClick={() => {
                onClose()
                onOpenSensorModal()
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ตั้งค่าเซนเซอร์ &rarr;</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'presets' ? (
            <div className="space-y-6">
              {/* Built-in Presets Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>โมเดลหุ่นยนต์มาตรฐาน (Built-in Robot Presets)</span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditRobot({
                        id: `custom-${Date.now()}`,
                        name: 'หุ่นยนต์ปรับแต่งเอง',
                        boardType: 'ATOM-VX',
                        bodyWidth: 150,
                        bodyLength: 170,
                        wheelBase: 150,
                        wheelRadius: 32,
                        maxSpeed: 700,
                        accelRate: 2000,
                        decelRate: 2600,
                        frictionCoeff: 0.9,
                        color: '#5f06c4',
                        presetType: 'custom',
                        isCustom: true
                      })
                      setActiveTab('customizer')
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-all shadow-md shadow-brand-900/20 active:scale-95"
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
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? 'bg-brand-50/50 dark:bg-slate-900 border-brand-500 ring-2 ring-brand-500/30 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-white/20"
                                style={{ backgroundColor: r.color || '#5f06c4' }}
                              />
                              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{r.name}</h4>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-semibold border border-slate-300 dark:border-slate-700">
                                {r.boardType}
                              </span>
                              {r.isCustom && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-300 dark:border-brand-800">
                                  Custom
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                            {r.description || 'หุ่นยนต์ปรับแต่งเฉพาะกิจ'}
                          </p>

                          {/* Robot Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono">
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                              <div className="text-slate-500 dark:text-slate-400 text-[10px] font-sans">ขนาดตัวถัง</div>
                              <div className="text-slate-900 dark:text-slate-100 font-bold mt-0.5">
                                {r.bodyWidth}x{r.bodyLength} <span className="text-[9px] text-slate-400 font-sans">มม.</span>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                              <div className="text-slate-500 dark:text-slate-400 text-[10px] font-sans">ความเร็วสูงสุด</div>
                              <div className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                                {(r.maxSpeed / 10).toFixed(0)} <span className="text-[9px] text-slate-400 font-sans">ซม./วิ</span>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                              <div className="text-slate-500 dark:text-slate-400 text-[10px] font-sans">การยึดเกาะ</div>
                              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
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
                              className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
                            >
                              แก้ไข / ปรับแต่ง
                            </button>
                            <button
                              onClick={() => handleExportRobotJson(r)}
                              title="ส่งออก Spec JSON"
                              className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {r.isCustom && (
                              <button
                                onClick={() => onDeleteCustomRobot(r.id)}
                                title="ลบหุ่นยนต์นี้"
                                className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-all border border-rose-200 dark:border-rose-800/40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => handleApplyRobot(r)}
                            disabled={isActive}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800 cursor-default'
                                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-900/20 active:scale-95'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>กำลังใช้งานอยู่</span>
                              </>
                            ) : (
                              <span>เลือกใช้งาน</span>
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
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-brand-500" />
                    <span>ข้อมูลและสีประจำหุ่นยนต์</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อหุ่นยนต์</label>
                      <input
                        type="text"
                        value={editRobot.name}
                        onChange={(e) => setEditRobot({ ...editRobot, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-brand-500 transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">บอร์ดควบคุม</label>
                      <select
                        value={editRobot.boardType}
                        onChange={(e) => setEditRobot({ ...editRobot, boardType: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-brand-500 transition-all font-sans"
                      >
                        <option value="ATOM-VX">PT-BOT ATOM-VX</option>
                        <option value="POP32i">POP32 / POP32i</option>
                        <option value="NANO">Arduino Nano (ATmega328P)</option>
                        <option value="ESP32">ESP32 DevKit</option>
                      </select>
                    </div>
                  </div>

                  {/* Color Palette Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">สีของตัวถังหุ่นยนต์</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setEditRobot({ ...editRobot, color: c.value })}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                            editRobot.color === c.value ? 'ring-2 ring-brand-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        >
                          {editRobot.color === c.value && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Dimensions */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-brand-500" />
                    <span>มิติและขนาดตัวถัง (Robot Geometry)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ความกว้างตัวถัง (มม.)</label>
                      <input
                        type="number"
                        min="80"
                        max="300"
                        value={editRobot.bodyWidth}
                        onChange={(e) => setEditRobot({ ...editRobot, bodyWidth: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ความยาวตัวถัง (มม.)</label>
                      <input
                        type="number"
                        min="100"
                        max="350"
                        value={editRobot.bodyLength}
                        onChange={(e) => setEditRobot({ ...editRobot, bodyLength: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ระยะห่างล้อ (WheelBase) (มม.)</label>
                      <input
                        type="number"
                        min="80"
                        max="280"
                        value={editRobot.wheelBase}
                        onChange={(e) => setEditRobot({ ...editRobot, wheelBase: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">รัศมีล้อ (Wheel Radius) (มม.)</label>
                      <input
                        type="number"
                        min="15"
                        max="60"
                        value={editRobot.wheelRadius}
                        onChange={(e) => setEditRobot({ ...editRobot, wheelRadius: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Physics & Motor Specifications */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-brand-500" />
                    <span>สมรรถนะมอเตอร์และฟิสิกส์ (Motor & Physics)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ความเร็วสูงสุด (มม./วิ)</label>
                      <input
                        type="number"
                        min="200"
                        max="2000"
                        step="50"
                        value={editRobot.maxSpeed}
                        onChange={(e) => setEditRobot({ ...editRobot, maxSpeed: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">สัมประสิทธิ์การยึดเกาะ (0.1 - 1.0)</label>
                      <input
                        type="number"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={editRobot.frictionCoeff}
                        onChange={(e) => setEditRobot({ ...editRobot, frictionCoeff: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">อัตราการเร่ง (มม./วิ²)</label>
                      <input
                        type="number"
                        min="500"
                        max="5000"
                        step="100"
                        value={editRobot.accelRate}
                        onChange={(e) => setEditRobot({ ...editRobot, accelRate: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">อัตราการเบรก (มม./วิ²)</label>
                      <input
                        type="number"
                        min="500"
                        max="6000"
                        step="100"
                        value={editRobot.decelRate}
                        onChange={(e) => setEditRobot({ ...editRobot, decelRate: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive 2D Canvas Preview & Apply Actions */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-500" />
                      <span>ตัวอย่างหุ่นยนต์ Real-time 2D</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Live Scale Preview</span>
                  </div>

                  {/* 2D Canvas Viewport */}
                  <div className="w-full h-64 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                  </div>

                  {/* Spec Summary Card */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2 shadow-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">อัตราส่วนตัวถัง (W/L):</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">
                        {(editRobot.bodyWidth / editRobot.bodyLength).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">เวลาเร่ง 0-60 ซม./วิ:</span>
                      <span className="text-brand-600 dark:text-brand-300 font-bold">
                        {(600 / editRobot.accelRate).toFixed(2)} วินาที
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">ความเร็วหมุนกลับตัว:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {((editRobot.maxSpeed * 2) / editRobot.wheelBase).toFixed(1)} rad/s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar for Customizer */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAsCustom}
                    className="flex-1 py-3 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-brand-700 dark:text-brand-300 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all shadow-xs"
                  >
                    บันทึกสเปกนี้ 💾
                  </button>

                  <button
                    onClick={() => handleApplyRobot(editRobot)}
                    className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shadow-brand-900/20 active:scale-95"
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
