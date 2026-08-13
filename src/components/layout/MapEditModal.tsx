'use client'

import { useState, useEffect } from 'react'
import { Settings2, X, Check, MapPin, Maximize2, Sparkles } from 'lucide-react'
import { MapDefinition } from '@/types/project'

interface MapEditModalProps {
  isOpen: boolean
  onClose: () => void
  mapDef: MapDefinition | null
  onUpdateMap: (updatedMap: MapDefinition) => void
}

export function MapEditModal({ isOpen, onClose, mapDef, onUpdateMap }: MapEditModalProps) {
  const [name, setName] = useState('')
  const [widthCm, setWidthCm] = useState(240)
  const [heightCm, setHeightCm] = useState(120)
  const [startX, setStartX] = useState(1200)
  const [startY, setStartY] = useState(600)
  const [startHeading, setStartHeading] = useState(0)

  useEffect(() => {
    if (mapDef) {
      setName(mapDef.name || '')
      setWidthCm(Math.round(mapDef.widthMm / 10))
      setHeightCm(Math.round(mapDef.heightMm / 10))
      setStartX(mapDef.startX)
      setStartY(mapDef.startY)
      setStartHeading(mapDef.startHeading)
    }
  }, [mapDef])

  if (!isOpen || !mapDef) return null

  // Quick Preset Dimensions
  const presets = [
    { label: '280 × 160 cm (Athletics)', w: 280, h: 160 },
    { label: '240 × 120 cm (Standard)', w: 240, h: 120 },
    { label: '200 × 120 cm (Wall Line)', w: 200, h: 120 },
    { label: '200 × 100 cm (Junior)', w: 200, h: 100 },
    { label: '122 × 244 cm (RT-TD)', w: 244, h: 122 }
  ]

  const handleCenterSpawn = () => {
    setStartX(Math.round((widthCm * 10) / 2))
    setStartY(Math.round((heightCm * 10) / 2))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const nameToUse = name.trim() || mapDef.name
    const updatedMap: MapDefinition = {
      ...mapDef,
      name: nameToUse,
      widthMm: widthCm * 10,
      heightMm: heightCm * 10,
      startX: startX,
      startY: startY,
      startHeading: startHeading
    }

    onUpdateMap(updatedMap)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                แก้ไขขนาดและข้อมูลสนาม (Edit Map Dimensions)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ปรับแต่งความกว้าง ความยาว และพิกัดวางหุ่นยนต์บนสนาม
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
          {/* Map Preview Image Thumbnail */}
          {mapDef.imageUrl && (
            <div className="w-full h-28 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 relative shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapDef.imageUrl}
                alt={mapDef.name}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-brand-700 dark:text-brand-300 text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-xs">
                ขนาดเดิม: {Math.round(mapDef.widthMm / 10)} × {Math.round(mapDef.heightMm / 10)} ซม.
              </div>
            </div>
          )}

          {/* Map Title Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ชื่อสนามแข่งขัน</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 transition-all font-sans"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>ขนาดมาตรฐานยอดนิยม (Quick Presets)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setWidthCm(p.w)
                    setHeightCm(p.h)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold border transition-all ${
                    widthCm === p.w && heightCm === p.h
                      ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field Dimensions (cm) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-brand-500" />
                <span>ความกว้าง Width (ซม.)</span>
              </label>
              <input
                type="number"
                min="50"
                max="600"
                value={widthCm}
                onChange={(e) => setWidthCm(Math.max(50, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-brand-500" />
                <span>ความยาว Height (ซม.)</span>
              </label>
              <input
                type="number"
                min="50"
                max="600"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(50, Number(e.target.value)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Initial Robot Spawn Coordinates */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
                <span>พิกัดจุดวางหุ่นยนต์เริ่มต้น</span>
              </div>
              <button
                type="button"
                onClick={handleCenterSpawn}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-bold"
              >
                ย้ายไปกึ่งกลางสนาม
              </button>
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
              <Check className="w-4 h-4" /> บันทึกการแก้ไขสนาม
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
