'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Sliders, Eye, EyeOff, Radio, RefreshCw, Bot } from 'lucide-react'
import { SensorConfigItem, SensorConfiguration, RobotSpec } from '@/types/project'
import { getDefaultSensorsForRobot } from '@/lib/robots'

interface SensorConfigModalProps {
  isOpen: boolean
  onClose: () => void
  sensorConfig: SensorConfiguration
  onChangeSensorConfig: (newConfig: SensorConfiguration) => void
  activeRobot?: RobotSpec
}

export function SensorConfigModal({
  isOpen,
  onClose,
  sensorConfig,
  onChangeSensorConfig,
  activeRobot
}: SensorConfigModalProps) {
  const [sensors, setSensors] = useState<SensorConfigItem[]>(sensorConfig.sensors)

  useEffect(() => {
    setSensors(sensorConfig.sensors)
  }, [sensorConfig])

  if (!isOpen) return null

  const handleToggleEnable = (id: string) => {
    const updated = sensors.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    setSensors(updated)
    onChangeSensorConfig({ sensors: updated })
  }

  const handleRemoveSensor = (id: string) => {
    const updated = sensors.filter((s) => s.id !== id)
    setSensors(updated)
    onChangeSensorConfig({ sensors: updated })
  }

  const handleAddSensor = (type: 'IR_LINE' | 'DISTANCE_TOF' | 'GYRO_IMU') => {
    const count = sensors.filter((s) => s.type === type).length
    let defaultPin = 0
    let defaultX = activeRobot ? Math.round(activeRobot.bodyLength / 2 - 10) : 70
    let defaultY = 0

    if (type === 'IR_LINE') {
      defaultPin = count
      defaultY = (count - 2) * 20
    } else if (type === 'DISTANCE_TOF') {
      defaultPin = 8 + count
      defaultX = activeRobot ? Math.round(activeRobot.bodyLength / 2) : 80
      defaultY = 0
    } else if (type === 'GYRO_IMU') {
      defaultPin = 9
      defaultX = 0
      defaultY = 0
    }

    const newSensor: SensorConfigItem = {
      id: `sensor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      pin: defaultPin,
      offsetX: defaultX,
      offsetY: defaultY,
      angle: 0,
      enabled: true,
      colorThreshold: 400
    }

    const updated = [...sensors, newSensor]
    setSensors(updated)
    onChangeSensorConfig({ sensors: updated })
  }

  const handleUpdateSensor = (id: string, updates: Partial<SensorConfigItem>) => {
    const updated = sensors.map((s) => (s.id === id ? { ...s, ...updates } : s))
    setSensors(updated)
    onChangeSensorConfig({ sensors: updated })
  }

  const handleResetToModelDefaults = () => {
    if (!activeRobot) return
    const defaults = getDefaultSensorsForRobot(activeRobot)
    setSensors(defaults)
    onChangeSensorConfig({ sensors: defaults })
  }

  // Calculate visualizer chassis dimensions
  const robotW = activeRobot ? activeRobot.bodyWidth : 140
  const robotL = activeRobot ? activeRobot.bodyLength : 160
  const chassisColor = activeRobot ? activeRobot.color : '#06b6d4'

  // Visualizer scale ratio (mm to px)
  const vizScale = 0.75
  const visWidthPx = Math.max(90, Math.min(180, Math.round(robotW * vizScale)))
  const visHeightPx = Math.max(110, Math.min(220, Math.round(robotL * vizScale)))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                ตั้งค่าเซนเซอร์ (Interactive Sensor Configurator)
                {activeRobot && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-mono font-medium flex items-center gap-1">
                    <Bot className="w-3 h-3" /> {activeRobot.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                กำหนดตำแหน่งเซนเซอร์อ่านเส้น IR, TOF Laser ระยะทาง และ IMU เข็มทิศบนตัวถังหุ่นยนต์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Sensor List Controls */}
          <div className="md:col-span-7 p-6 space-y-4 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-slate-800">
            {/* Model Defaults & Quick Add Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              {activeRobot && (
                <button
                  onClick={handleResetToModelDefaults}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  title="โหลดตำแหน่งและชนิดเซนเซอร์มาตรฐานของโมเดลนี้"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>โหลด Default Sensors ประจำโมเดล</span>
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddSensor('IR_LINE')}
                  className="px-2.5 py-1.5 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + IR Line
                </button>
                <button
                  onClick={() => handleAddSensor('DISTANCE_TOF')}
                  className="px-2.5 py-1.5 text-[11px] font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + TOF Laser
                </button>
                <button
                  onClick={() => handleAddSensor('GYRO_IMU')}
                  className="px-2.5 py-1.5 text-[11px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Gyro/IMU
                </button>
              </div>
            </div>

            {/* Sensor List */}
            <div className="space-y-3">
              {sensors.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  ยังไม่ได้ติดตั้งเซนเซอร์ คลิกปุ่มด้านบนหรือเลือก &quot;โหลด Default Sensors&quot; เพื่อเพิ่มเซนเซอร์
                </div>
              ) : (
                sensors.map((sensor, idx) => (
                  <div
                    key={sensor.id}
                    className={`p-3 rounded-xl border transition space-y-2 ${
                      sensor.enabled
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/20 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleEnable(sensor.id)}
                          className={`p-1 rounded-md transition ${
                            sensor.enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:bg-slate-800'
                          }`}
                        >
                          {sensor.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <span
                          className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                            sensor.type === 'IR_LINE'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : sensor.type === 'DISTANCE_TOF'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          #{idx + 1} {sensor.type}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveSensor(sensor.id)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sensor parameters */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-400">Pin / Channel</label>
                        <input
                          type="number"
                          min="0"
                          max="32"
                          value={sensor.pin}
                          onChange={(e) => handleUpdateSensor(sensor.id, { pin: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Offset X (mm)</label>
                        <input
                          type="number"
                          min="-150"
                          max="200"
                          value={sensor.offsetX}
                          onChange={(e) => handleUpdateSensor(sensor.id, { offsetX: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Offset Y (mm)</label>
                        <input
                          type="number"
                          min="-150"
                          max="150"
                          value={sensor.offsetY}
                          onChange={(e) => handleUpdateSensor(sensor.id, { offsetY: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Angle (deg)</label>
                        <input
                          type="number"
                          min="-180"
                          max="180"
                          value={sensor.angle}
                          onChange={(e) => handleUpdateSensor(sensor.id, { angle: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Live Interactive Robot Visualizer */}
          <div className="md:col-span-5 p-6 bg-slate-950 flex flex-col items-center justify-center relative min-h-[320px]">
            <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>ผังตำแหน่งเซนเซอร์บนตัวถังหุ่นยนต์</span>
            </div>

            {/* Robot Chassis Canvas Box */}
            <div className="w-64 h-72 border border-slate-800 rounded-2xl bg-slate-900/60 relative flex items-center justify-center shadow-inner overflow-hidden">
              {/* Chassis outline matching activeRobot dimensions */}
              <div
                style={{
                  width: `${visWidthPx}px`,
                  height: `${visHeightPx}px`,
                  borderColor: chassisColor
                }}
                className="border-2 rounded-xl bg-slate-900/90 relative flex items-center justify-center shadow-lg transition-all"
              >
                <span className="text-[10px] font-mono text-slate-500 text-center px-1">
                  {robotW}x{robotL}mm
                </span>

                {/* Arrow Nose */}
                <div
                  style={{ borderBottomColor: chassisColor }}
                  className="absolute -top-3.5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px]"
                />

                {/* Render Sensors on Visualizer */}
                {sensors.map((sensor) => {
                  if (!sensor.enabled) return null
                  // Map X offset (mm) to Visualizer Top px (forward is -Y from center)
                  // Map Y offset (mm) to Visualizer Right px (right is +X from center)
                  const centerX = visWidthPx / 2
                  const centerY = visHeightPx / 2

                  const topPx = centerY - sensor.offsetX * vizScale
                  const leftPx = centerX + sensor.offsetY * vizScale

                  return (
                    <div
                      key={sensor.id}
                      style={{ top: `${topPx}px`, left: `${leftPx}px` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 shadow-md transition ${
                          sensor.type === 'IR_LINE'
                            ? 'bg-emerald-500 border-white'
                            : sensor.type === 'DISTANCE_TOF'
                            ? 'bg-cyan-500 border-white'
                            : 'bg-purple-500 border-white'
                        }`}
                      />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap z-10 font-mono shadow-xl">
                        Pin {sensor.pin} ({sensor.type})
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              ตำแหน่งเซนเซอร์จะปรับตำแหน่งจริงตามมิติตัวถังในมุมมอง 2D และ 3D อัตโนมัติ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            ใช้ตำแหน่งเซนเซอร์นี้ & ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  )
}
