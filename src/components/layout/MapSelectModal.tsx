'use client'

import { useState, useRef, useEffect } from 'react'
import { Map, X, Search, Check, Plus, Upload, Compass, Maximize2, Trash2, Paintbrush, Pencil } from 'lucide-react'
import { MapDefinition } from '@/types/project'
import { BUILTIN_MAPS } from '@/lib/maps'
import { generateBuiltinMapCanvas } from '@/lib/mapRenderer'

interface MapSelectModalProps {
  isOpen: boolean
  onClose: () => void
  mapId: string
  onMapChange: (mapId: string) => void
  customMaps?: MapDefinition[]
  onOpenCustomMapModal?: () => void
  onOpenMapDrawerModal?: () => void
  onEditCustomMap?: (map: MapDefinition) => void
  onDeleteCustomMap?: (mapId: string) => void
}

function MapThumbnail({ mapDef }: { mapDef: MapDefinition }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (mapDef.isCustom || !canvasRef.current) return
    const srcCanvas = generateBuiltinMapCanvas(mapDef, 600)
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      canvasRef.current.width = srcCanvas.width
      canvasRef.current.height = srcCanvas.height
      ctx.drawImage(srcCanvas, 0, 0)
    }
  }, [mapDef])

  if (mapDef.imageUrl) {
    return (
      <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapDef.imageUrl}
          alt={mapDef.name}
          className="w-full h-full object-contain rounded"
        />
      </div>
    )
  }

  return (
    <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain rounded"
      />
    </div>
  )
}

export function MapSelectModal({
  isOpen,
  onClose,
  mapId,
  onMapChange,
  customMaps = [],
  onOpenCustomMapModal,
  onOpenMapDrawerModal,
  onEditCustomMap,
  onDeleteCustomMap
}: MapSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'custom'>('all')

  if (!isOpen) return null

  const allMaps: MapDefinition[] = [...BUILTIN_MAPS, ...customMaps]

  const filteredMaps = allMaps.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeTab === 'builtin') return matchesSearch && !m.isCustom
    if (activeTab === 'custom') return matchesSearch && m.isCustom
    return matchesSearch
  })

  const handleSelectMap = (id: string) => {
    onMapChange(id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                เลือกสนามแข่งขัน (Select Map)
              </h2>
              <p className="text-xs text-slate-400">
                เลือกสนามมาตรฐานสำหรับการซ้อมจำลอง หรืออัปโหลดรูปสนามของคุณเอง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              ทั้งหมด ({allMaps.length})
            </button>
            <button
              onClick={() => setActiveTab('builtin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'builtin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              สนามมาตรฐาน ({BUILTIN_MAPS.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              สนามกำหนดเอง ({customMaps.length})
            </button>
          </div>

          {/* Search Box & Upload Action */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสนาม..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {onOpenMapDrawerModal && (
              <button
                onClick={() => {
                  onClose()
                  onOpenMapDrawerModal()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition shrink-0"
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>🎨 วาดสนามเอง</span>
              </button>
            )}

            {onOpenCustomMapModal && (
              <button
                onClick={() => {
                  onClose()
                  onOpenCustomMapModal()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ อัปโหลดไฟล์</span>
              </button>
            )}
          </div>
        </div>

        {/* Maps Grid List */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {filteredMaps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Map className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-medium">ไม่พบสนามตรงกับคำค้นหา "{searchQuery}"</p>
              <p className="text-xs text-slate-500">ลองใช้คำค้นหาอื่น หรือคลิกปุ่มอัปโหลดสนามใหม่</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaps.map((map) => {
                const isActive = map.id === mapId
                const widthCm = map.widthMm / 10
                const heightCm = map.heightMm / 10

                return (
                  <div
                    key={map.id}
                    onClick={() => handleSelectMap(map.id)}
                    className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Active Status Badge */}
                    {isActive && (
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold backdrop-blur-md">
                        <Check className="w-3 h-3" />
                        <span>กำลังใช้งาน</span>
                      </div>
                    )}

                    {/* Custom Tag */}
                    {map.isCustom && !isActive && (
                      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-medium">
                        Custom
                      </div>
                    )}

                    {/* Thumbnail Preview */}
                    <MapThumbnail mapDef={map} />

                    {/* Map Info */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <h3
                          className={`font-semibold text-xs truncate ${
                            isActive ? 'text-emerald-300' : 'text-slate-200 group-hover:text-cyan-300'
                          }`}
                        >
                          {map.name}
                        </h3>

                        {map.isCustom && (
                          <div className="flex items-center gap-1 shrink-0">
                            {onEditCustomMap && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditCustomMap(map)
                                }}
                                className="p-1 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition"
                                title="แก้ไขขนาดและข้อมูลสนาม"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {onDeleteCustomMap && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm(`คุณต้องการลบสนาม "${map.name}" ใช่หรือไม่?`)) {
                                    onDeleteCustomMap(map.id)
                                  }
                                }}
                                className="p-1 rounded-lg bg-slate-900/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 transition"
                                title="ลบสนามกำหนดเองนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Maximize2 className="w-3 h-3 text-slate-500" />
                          {widthCm} × {heightCm} cm
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Compass className="w-3 h-3 text-slate-500" />
                          {map.startX},{map.startY}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Draw Custom Map Card Option */}
              {onOpenMapDrawerModal && (
                <div
                  onClick={() => {
                    onClose()
                    onOpenMapDrawerModal()
                  }}
                  className="rounded-xl border-2 border-dashed border-emerald-800/80 hover:border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-950/40 transition p-4 flex flex-col items-center justify-center min-h-[190px] cursor-pointer text-center group"
                >
                  <div className="p-3 rounded-full bg-slate-900 group-hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 group-hover:border-emerald-500/40 transition mb-2">
                    <Paintbrush className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition">
                    🎨 วาดสนามแข่งขันเอง
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    เครื่องมือพู่กัน เส้นตรง สี่เหลี่ยม วงกลม
                  </span>
                </div>
              )}

              {/* Upload Card Option */}
              {onOpenCustomMapModal && (
                <div
                  onClick={() => {
                    onClose()
                    onOpenCustomMapModal()
                  }}
                  className="rounded-xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/30 hover:bg-slate-900/60 transition p-4 flex flex-col items-center justify-center min-h-[190px] cursor-pointer text-center group"
                >
                  <div className="p-3 rounded-full bg-slate-900 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-300 border border-slate-800 group-hover:border-cyan-500/30 transition mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                    + อัปโหลดไฟล์รูปภาพ
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    รองรับไฟล์รูปภาพ PNG / JPG
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>รวมทั้งหมด {allMaps.length} สนาม</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  )
}
