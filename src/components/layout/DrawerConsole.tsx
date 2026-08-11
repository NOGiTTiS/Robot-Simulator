'use client'

import { useState } from 'react'
import { Terminal, Activity, ChevronUp, ChevronDown, Trash2, ArrowDownCircle, Gauge } from 'lucide-react'
import { SensorConfigItem, RobotPhysicsState } from '@/types/project'
import { HardwareState } from '@/lib/interpreter/boards'

interface DrawerConsoleProps {
  logs?: string[]
  onClearLogs?: () => void
  sensors?: SensorConfigItem[]
  hwState?: HardwareState
  physicsState?: RobotPhysicsState
}

export function DrawerConsole({
  logs = [],
  onClearLogs,
  sensors = [],
  hwState,
  physicsState
}: DrawerConsoleProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'serial' | 'sensors' | 'telemetry'>('serial')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)

  const headingDeg = physicsState ? Math.round((physicsState.heading * 180) / Math.PI) : 0

  return (
    <div
      className={`glass-panel border-t border-slate-800 transition-all duration-300 flex flex-col shrink-0 z-20 ${
        isOpen ? 'h-52' : 'h-8'
      }`}
    >
      {/* Console Header / Tabs Bar */}
      <div className="h-8 bg-slate-900/90 px-3 flex items-center justify-between text-xs border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-1">
          {/* Collapse/Expand button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition mr-1"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Tab Buttons */}
          <button
            onClick={() => {
              setIsOpen(true)
              setActiveTab('serial')
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-medium transition ${
              activeTab === 'serial' && isOpen
                ? 'bg-slate-950 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Serial Monitor</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(true)
              setActiveTab('sensors')
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-medium transition ${
              activeTab === 'sensors' && isOpen
                ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Sensor Debug</span>
            {sensors.filter((s) => s.enabled).length > 0 && (
              <span className="text-[9px] px-1 rounded-full bg-emerald-950 text-emerald-400 font-mono">
                {sensors.filter((s) => s.enabled).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setIsOpen(true)
              setActiveTab('telemetry')
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-medium transition ${
              activeTab === 'telemetry' && isOpen
                ? 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Motors & Kinematics</span>
          </button>
        </div>

        {/* Action Controls right */}
        {isOpen && (
          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title="Toggle Auto-Scroll"
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition ${
                autoScroll ? 'text-cyan-400 bg-cyan-950/40' : 'hover:text-slate-200'
              }`}
            >
              <ArrowDownCircle className="w-3 h-3" />
              <span>Auto-scroll</span>
            </button>

            {onClearLogs && (
              <button
                onClick={onClearLogs}
                title="Clear Logs"
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-slate-800 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drawer Body Content */}
      {isOpen && (
        <div className="flex-1 bg-slate-950/90 p-3 overflow-y-auto font-mono text-xs text-slate-300">
          {activeTab === 'serial' && (
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-2">
                  [Serial Monitor Ready] Serial.println() outputs will appear here when running simulation...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-600 select-none">{`[${index + 1}]`}</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sensors' && (
            <div>
              {sensors.length === 0 ? (
                <div className="text-slate-500 italic py-2">No sensors configured.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                  {sensors.map((s, idx) => {
                    if (!s.enabled) return null

                    const val = hwState ? hwState.analogPins[s.pin] ?? 0 : 0
                    const digVal = hwState ? hwState.digitalPins[s.pin] ?? 0 : 0

                    if (s.type === 'IR_LINE') {
                      const isLine = digVal === 1
                      return (
                        <div key={s.id || idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              IR Line #{idx}
                            </span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isLine ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                              {isLine ? 'LINE' : 'FLOOR'}
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-emerald-400 font-bold text-base">{val}</span>
                            <span className="text-[10px] text-slate-500 ml-1">/1023</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Pin A{s.pin}</span>
                            <span>{s.offsetX >= 0 ? `+${s.offsetX}` : s.offsetX}mm</span>
                          </div>
                        </div>
                      )
                    }

                    if (s.type === 'DISTANCE_TOF') {
                      return (
                        <div key={s.id || idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              TOF Distance
                            </span>
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                              LASER
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-cyan-400 font-bold text-base">{val}</span>
                            <span className="text-[10px] text-slate-400 ml-1">cm</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Pin A{s.pin}</span>
                            <span>{s.angle}°</span>
                          </div>
                        </div>
                      )
                    }

                    if (s.type === 'GYRO_IMU') {
                      return (
                        <div key={s.id || idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              Gyro IMU
                            </span>
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                              HEADING
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-indigo-400 font-bold text-base">{headingDeg}°</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Pin A{s.pin}</span>
                            <span>Z-Axis</span>
                          </div>
                        </div>
                      )
                    }

                    return null
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Motor 1 (Left Speed)</span>
                <span className="text-cyan-400 font-bold text-base">{hwState?.leftMotorSpeed ?? 0} %</span>
                <span className="text-[10px] text-slate-500 block">Target Speed (-100..100)</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Motor 2 (Right Speed)</span>
                <span className="text-cyan-400 font-bold text-base">{hwState?.rightMotorSpeed ?? 0} %</span>
                <span className="text-[10px] text-slate-500 block">Target Speed (-100..100)</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Robot World Pos (X, Y)</span>
                <span className="text-emerald-400 font-bold text-base">
                  {physicsState ? `${Math.round(physicsState.x)}, ${Math.round(physicsState.y)}` : '0, 0'}
                </span>
                <span className="text-[10px] text-slate-500 block">Coordinates in mm</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Encoders (L / R)</span>
                <span className="text-indigo-400 font-bold text-base">
                  {physicsState ? `${Math.round(physicsState.leftEncoder)} / ${Math.round(physicsState.rightEncoder)}` : '0 / 0'}
                </span>
                <span className="text-[10px] text-slate-500 block">Ticks count</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
