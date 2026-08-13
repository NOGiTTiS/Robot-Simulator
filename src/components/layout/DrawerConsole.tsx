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
      className={`glass-panel border-t border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shrink-0 z-20 font-sans ${
        isOpen ? 'h-56' : 'h-9'
      }`}
    >
      {/* Console Header / Tabs Bar */}
      <div className="h-9 bg-slate-100/90 dark:bg-slate-900/90 px-3 flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-1">
          {/* Collapse/Expand button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all mr-1"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Tab Buttons */}
          <button
            onClick={() => {
              setIsOpen(true)
              setActiveTab('serial')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-semibold transition-all ${
              activeTab === 'serial' && isOpen
                ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-300 border-t-2 border-brand-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Serial Monitor (คอนโซล)</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(true)
              setActiveTab('sensors')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-semibold transition-all ${
              activeTab === 'sensors' && isOpen
                ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ตรวจสอบเซนเซอร์</span>
            {sensors.filter((s) => s.enabled).length > 0 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                {sensors.filter((s) => s.enabled).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setIsOpen(true)
              setActiveTab('telemetry')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-semibold transition-all ${
              activeTab === 'telemetry' && isOpen
                ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>สถานะมอเตอร์และการเคลื่อนที่</span>
          </button>
        </div>

        {/* Action Controls right */}
        {isOpen && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-sans">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title="สลับการเลื่อนจอลงอัตโนมัติ"
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                autoScroll
                  ? 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800'
                  : 'hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>เลื่อนลงอัตโนมัติ</span>
            </button>

            {onClearLogs && (
              <button
                onClick={onClearLogs}
                title="ล้างข้อความในคอนโซล"
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างข้อมูล</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drawer Body Content */}
      {isOpen && (
        <div className="flex-1 bg-white/90 dark:bg-slate-950/90 p-3 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-300">
          {activeTab === 'serial' && (
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-500 italic py-2 font-sans">
                  [ระบบพร้อมใช้งาน] ข้อความคำสั่ง Serial.println() จะแสดงขึ้นที่นี่เมื่อสั่งรันการจำลอง...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-400 dark:text-slate-600 select-none">{`[${index + 1}]`}</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sensors' && (
            <div>
              {sensors.length === 0 ? (
                <div className="text-slate-500 italic py-2 font-sans">ยังไม่ได้ติดตั้งเซนเซอร์บนหุ่นยนต์</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
                  {sensors.map((s, idx) => {
                    if (!s.enabled) return null

                    const val = hwState ? hwState.analogPins[s.pin] ?? 0 : 0
                    const digVal = hwState ? hwState.digitalPins[s.pin] ?? 0 : 0

                    if (s.type === 'IR_LINE') {
                      const isLine = digVal === 1
                      return (
                        <div key={s.id || idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase font-sans">
                              IR Line #{idx}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-sans ${isLine ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {isLine ? 'พบเส้น' : 'พื้นสนาม'}
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">{val}</span>
                            <span className="text-[10px] text-slate-400 ml-1">/1023</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                            <span>Pin A{s.pin}</span>
                            <span>{s.offsetX >= 0 ? `+${s.offsetX}` : s.offsetX} มม.</span>
                          </div>
                        </div>
                      )
                    }

                    if (s.type === 'DISTANCE_TOF') {
                      return (
                        <div key={s.id || idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase font-sans">
                              วัดระยะทาง TOF
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800 font-sans">
                              LASER
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-brand-600 dark:text-brand-400 font-bold text-base">{val}</span>
                            <span className="text-[10px] text-slate-400 ml-1">ซม.</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                            <span>Pin A{s.pin}</span>
                            <span>{s.angle}°</span>
                          </div>
                        </div>
                      )
                    }

                    if (s.type === 'GYRO_IMU') {
                      return (
                        <div key={s.id || idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase font-sans">
                              เข็มทิศ Gyro IMU
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 font-sans">
                              มุมองศา
                            </span>
                          </div>
                          <div className="my-1">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base">{headingDeg}°</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-sans">
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
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block font-sans">มอร์เตอร์ 1 (ความเร็วล้อซ้าย)</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold text-base">{hwState?.leftMotorSpeed ?? 0} %</span>
                <span className="text-[10px] text-slate-400 block font-sans">ความเร็วเป้าหมาย (-100..100)</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block font-sans">มอเตอร์ 2 (ความเร็วล้อขวา)</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold text-base">{hwState?.rightMotorSpeed ?? 0} %</span>
                <span className="text-[10px] text-slate-400 block font-sans">ความเร็วเป้าหมาย (-100..100)</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block font-sans">พิกัดบนสนาม (X, Y)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  {physicsState ? `${Math.round(physicsState.x)}, ${Math.round(physicsState.y)}` : '0, 0'}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">หน่วยพิกัดเป็น มม.</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block font-sans">ระยะหมุนล้อ Encoders (ซ้าย/ขวา)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  {physicsState ? `${Math.round(physicsState.leftEncoder)} / ${Math.round(physicsState.rightEncoder)}` : '0 / 0'}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">หน่วยเป็น มม.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

