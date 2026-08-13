'use client'

import { Smartphone, Monitor, Tablet, X, Check, AlertTriangle, RotateCw } from 'lucide-react'

interface SmallScreenWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueAnyway: () => void
  screenWidth?: number
}

export function SmallScreenWarningModal({
  isOpen,
  onClose,
  onContinueAnyway,
  screenWidth = 0
}: SmallScreenWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Header gradient bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-brand-500 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
              <Smartphone className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight leading-tight">
                  คำแนะนำขนาดหน้าจอ
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white">
                  {screenWidth > 0 ? `${screenWidth}px` : 'Small Screen'}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                TUNorth Robot Simulator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Main Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
              <p className="font-bold text-sm text-amber-950 dark:text-amber-100">
                ตรวจพบหน้าจอขนาดเล็ก (Smartphone Detected)
              </p>
              <p>
                ระบบจำลองหุ่นยนต์ได้รับการออกแบบสำหรับการใช้งานบน{' '}
                <strong className="text-amber-950 dark:text-amber-300">คอมพิวเตอร์</strong> หรือ{' '}
                <strong className="text-amber-950 dark:text-amber-300">แท็บเล็ต</strong> เพื่อให้เขียนโค้ดภาษา C++ / Arduino และดูผลจำลอง 2D/3D ได้อย่างเต็มประสิทธิภาพ
              </p>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              อุปกรณ์ที่รองรับการใช้งานอย่างมีประสิทธิภาพ
            </h4>

            {/* Desktop Option */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    คอมพิวเตอร์ (Desktop / Laptop)
                  </h5>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    แนะนำสูงสุด
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ความละเอียด 1024px ขึ้นไป เหมาะสมที่สุดสำหรับการเขียนโค้ดและจำลอง
                </p>
              </div>
            </div>

            {/* Tablet Option */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Tablet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    แท็บเล็ต (Tablet / iPad)
                  </h5>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> แนวนอน
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  รองรับการทำงาน responsive แนะนำให้หมุนหน้าจอเป็นแนวนอน (Landscape)
                </p>
              </div>
            </div>
          </div>

          {/* Action Note */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
            * หากต้องการทดลองใช้งานบนสมาร์ทโฟน คุณยังคงสามารถทดลองใช้งานต่อได้
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onContinueAnyway}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>เข้าใจแล้ว ดำเนินการต่อเลย</span>
          </button>
        </div>
      </div>
    </div>
  )
}
