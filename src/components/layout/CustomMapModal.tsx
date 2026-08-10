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
      setErrorMsg('Please select a valid image file (PNG/JPG)')
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
      setErrorMsg('Please select an image file for the custom map')
      return
    }

    const nameToUse = mapName.trim() || 'Custom Field'
    const newMap: MapDefinition = {
      id: `custom-${Date.now()}`,
      name: `${nameToUse} (${widthCm}x${heightCm}cm)`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Upload Custom Competition Map</h2>
              <p className="text-xs text-slate-400">Upload PNG/JPG map image with dimensions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Map Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Map Title Name</label>
            <input
              type="text"
              placeholder="e.g. My High School Line Track"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Image Dropzone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Map Graphic File (PNG / JPG)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition flex flex-col items-center justify-center min-h-[120px]"
            >
              {imageSrc ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="Preview" className="max-h-24 object-contain mx-auto rounded border border-slate-700" />
                  <p className="text-xs text-cyan-400 font-mono">Click to replace image file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Click or drag map image here</p>
                  <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP formats</p>
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
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Width (cm)</label>
              <input
                type="number"
                min="50"
                max="500"
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="500"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Initial Robot Spawn Position */}
          <div className="pt-2 border-t border-slate-800/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <MapPin className="w-3.5 h-3.5" /> Initial Robot Spawn Coordinates
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400">Start X (mm)</label>
                <input
                  type="number"
                  value={startX}
                  onChange={(e) => setStartX(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Start Y (mm)</label>
                <input
                  type="number"
                  value={startY}
                  onChange={(e) => setStartY(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Heading (deg)</label>
                <input
                  type="number"
                  value={startHeading}
                  onChange={(e) => setStartHeading(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" /> Save & Load Custom Map
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
