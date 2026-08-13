'use client'

import { useState } from 'react'
import {
  BookOpen,
  X,
  Code,
  Sparkles,
  Check,
  FileCode,
  Plus,
  ArrowRight,
  Layers,
  Search,
  SlidersHorizontal
} from 'lucide-react'
import { CODE_TEMPLATES, CodeTemplate } from '@/lib/templates'

interface CodeTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: CodeTemplate, mode: 'replace' | 'newTab') => void
  currentTabName: string
}

export function CodeTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTabName
}: CodeTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [activeTemplate, setActiveTemplate] = useState<CodeTemplate>(CODE_TEMPLATES[0])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loadMode, setLoadMode] = useState<'replace' | 'newTab'>('replace')

  if (!isOpen) return null

  const categories = [
    { id: 'ALL', label: 'ทั้งหมด' },
    { id: 'Basic', label: 'พื้นฐาน' },
    { id: 'Sensor', label: 'เซนเซอร์' },
    { id: 'Algorithm', label: 'อัลกอริทึม' },
    { id: 'Sumo', label: 'หุ่นยนต์ซูโม่' }
  ]

  const filteredTemplates = CODE_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'ALL' || tpl.category === selectedCategory
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleApply = () => {
    if (activeTemplate) {
      onSelectTemplate(activeTemplate, loadMode)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  คลังตัวอย่างโค้ดมาตรฐาน (Code Examples Library)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium border border-brand-300 dark:border-brand-800">
                  5 ตัวอย่างพร้อมใช้งาน
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เลือกโค้ดตัวอย่างสำหรับการเรียนรู้การควบคุมหุ่นยนต์ภาษา C++ / Arduino
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left List & Right Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Panel: Filter & List */}
          <div className="w-full md:w-5/12 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 bg-slate-50/50 dark:bg-slate-950/40 gap-3 overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาตัวอย่างโค้ด..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-500 outline-none transition text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Categories Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  ไม่พบตัวอย่างโค้ดที่ตรงกับการค้นหา
                </div>
              ) : (
                filteredTemplates.map((tpl) => {
                  const isSelected = activeTemplate?.id === tpl.id
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setActiveTemplate(tpl)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-brand-500 dark:border-brand-500 shadow-md shadow-brand-500/10'
                          : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {tpl.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            tpl.difficulty === 'เริ่มต้น'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : tpl.difficulty === 'ปานกลาง'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {tpl.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {tpl.description}
                      </p>

                      <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-brand-600 dark:text-brand-400">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{tpl.fileName}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Template Detail & Preview */}
          <div className="w-full md:w-7/12 flex flex-col p-5 bg-white dark:bg-slate-900 overflow-hidden">
            {activeTemplate ? (
              <div className="flex-1 flex flex-col overflow-hidden gap-4">
                {/* Info Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {activeTemplate.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                      {activeTemplate.fileName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeTemplate.description}
                  </p>
                </div>

                {/* Code Preview Header */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono shrink-0">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-brand-500" />
                    <span>ตัวอย่างซอร์สโค้ด (C++ / Arduino)</span>
                  </span>
                  <span>{activeTemplate.code.split('\n').length} บรรทัด</span>
                </div>

                {/* Code Viewport */}
                <div className="flex-1 rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-auto border border-slate-800 custom-scrollbar leading-relaxed">
                  <pre className="whitespace-pre">{activeTemplate.code}</pre>
                </div>

                {/* Import Mode Options */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      วิธีโหลด:
                    </span>
                    <button
                      type="button"
                      onClick={() => setLoadMode('replace')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        loadMode === 'replace'
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${loadMode === 'replace' ? 'opacity-100' : 'opacity-0'}`} />
                      <span>แทนที่ใน {currentTabName}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoadMode('newTab')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        loadMode === 'newTab'
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>สร้าง Tab ใหม่</span>
                    </button>
                  </div>

                  <button
                    onClick={handleApply}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>นำโค้ดมาใช้งาน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                กรุณาเลือกตัวอย่างโค้ดจากรายการฝั่งซ้าย
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
