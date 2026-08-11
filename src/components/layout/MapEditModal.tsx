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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                แก้ไขขนาดและข้อมูลสนาม (Edit Map Dimensions)
              </h2>
              <p className="text-xs text-slate-400">
                ปรับแต่งความกว้าง ความยาว และพิกัดวางหุ่นยนต์บนสนาม
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Map Preview Image Thumbnail */}
          {mapDef.imageUrl && (
            <div className="w-full h-28 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapDef.imageUrl}
                alt={mapDef.name}
                className="w-full h-full object-contain rounded"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-cyan-300 text-[10px] font-mono border border-slate-800 backdrop-blur-sm">
                ขนาดเดิม: {Math.round(mapDef.widthMm / 10)} × {Math.round(mapDef.heightMm / 10)} cm
              </div>
            </div>
          )}

          {/* Map Title Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อสนามแข่งขัน</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                    widthCm === p.w && heightCm === p.h
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field Dimensions (cm) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>ความกว้าง Width (cm)</span>
              </label>
              <input
                type="number"
                min="50"
                max="600"
                value={widthCm}
                onChange={(e) => setWidthCm(Math.max(50, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>ความยาว Height (cm)</span>
              </label>
              <input
                type="number"
                min="50"
                max="600"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(50, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Initial Robot Spawn Coordinates */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>พิกัดจุดวางหุ่นยนต์เริ่มต้น</span>
              </div>
              <button
                type="button"
                onClick={handleCenterSpawn}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
              >
                ย้ายไปกึ่งกลางสนาม
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Start X (mm)</label>
                <input
                  type="number"
                  value={startX}
                  onChange={(e) => setStartX(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Start Y (mm)</label>
                <input
                  type="number"
                  value={startY}
                  onChange={(e) => setStartY(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Heading (deg)</label>
                <input
                  type="number"
                  value={startHeading}
                  onChange={(e) => setStartHeading(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" /> บันทึกการแก้ไขสนาม
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
