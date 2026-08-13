'use client'

import { useState, useRef } from 'react'
import { Upload, X, MapPin, Check } from 'lucide-react'
import { MapDefinition } from '@/types/project'

interface CustomMapModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMap: (newMap: MapDefinition) => void
}

export function CustomMapModal({ isOpen, onClose, onAddMap }: CustomMapModalProps) {
  const [mapName, setMapName] = useState('')
  const [widthCm, setWidthCm] = useState(240)
  const [heightCm, setHeightCm] = useState(120)
  const [startX, setStartX] = useState(1200)
  const [startY, setStartY] = useState(600)
  const [startHeading, setStartHeading] = useState(0)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG/JPG)')
      return
    }

    setErrorMsg('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImageSrc(result)
      if (!mapName) {
        setMapName(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageSrc) {
      setErrorMsg('กรุณาเลือกไฟล์รูปภาพสนามแข่งขันก่อนบันทึก')
      return
    }

    const nameToUse = mapName.trim() || 'สนามอัปโหลดส่วนตัว'
    const newMap: MapDefinition = {
      id: `custom-${Date.now()}`,
      name: `${nameToUse} (${widthCm}x${heightCm}ซม.)`,
      imageUrl: imageSrc,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                อัปโหลดรูปภาพสนามแข่งขัน (Upload Custom Map)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                นำเข้าไฟล์รูปภาพ PNG / JPG พร้อมระบุขนาดความกว้างความยาวสนามจริง
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Map Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ชื่อสนามแข่งขัน</label>
            <input
              type="text"
              placeholder="เช่น สนามซ้อมแข่งโรงเรียนเตรียมอุดมฯ..."
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 transition-all font-sans"
            />
          </div>

          {/* Image Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ไฟล์กราฟิกรูปภาพสนาม (PNG / JPG)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-brand-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 dark:bg-slate-950/50 hover:bg-brand-50/30 dark:hover:bg-slate-950 transition-all flex flex-col items-center justify-center min-h-[130px] group"
            >
              {imageSrc ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="Preview" className="max-h-28 object-contain mx-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs" />
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">คลิกเพื่อเปลี่ยนรูปภาพสนามใหม่</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">คลิกเลือก หรือลากไฟล์รูปภาพสนามมาวางที่นี่</p>
                  <p className="text-[10px] text-slate-400">รองรับไฟล์ฟอร์แมต PNG, JPG, WEBP</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Field Dimensions (cm) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ความกว้าง (ซม.)</label>
              <input
                type="number"
                min="50"
                max="500"
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ความยาว (ซม.)</label>
              <input
                type="number"
                min="50"
                max="500"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Initial Robot Spawn Position */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <MapPin className="w-4 h-4" /> พิกัดจุดวางหุ่นยนต์เริ่มต้น
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Start X (มม.)</label>
                <input
                  type="number"
                  value={startX}
                  onChange={(e) => setStartX(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Start Y (มม.)</label>
                <input
                  type="number"
                  value={startY}
                  onChange={(e) => setStartY(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Heading (องศา)</label>
                <input
                  type="number"
                  value={startHeading}
                  onChange={(e) => setStartHeading(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-brand-900/20 active:scale-95"
            >
              <Check className="w-4 h-4" /> บันทึกและเพิ่มสนามนี้
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
