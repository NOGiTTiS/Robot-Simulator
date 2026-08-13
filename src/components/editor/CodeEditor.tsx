'use client'

import { useRef, useEffect, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import {
  Type,
  Plus,
  Minus,
  RotateCcw,
  FileCode,
  AlertCircle,
  RefreshCw,
  Sparkles,
  X,
  Edit2,
  Check,
  FileText,
  Trash2,
  Code
} from 'lucide-react'
import { CodeTab } from '@/types/project'

interface CodeEditorProps {
  files: CodeTab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTab: (name: string) => void
  onDeleteTab: (id: string) => void
  onRenameTab: (id: string, newName: string) => void
  onChangeCode: (id: string, newCode: string) => void
  fontSize: number
  onFontSizeChange: (size: number | ((prev: number) => number)) => void
  boardType: string
  theme?: 'dark' | 'light'
}

function CodeEditorSkeleton() {
  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 font-mono select-none animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800/60 rounded w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800/40 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800/30 rounded w-2/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded w-2/5" />
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-brand-600 dark:text-brand-300 bg-slate-100 dark:bg-slate-900/60 py-2.5 rounded-xl border border-brand-200 dark:border-brand-900/40">
        <Sparkles className="w-4 h-4 animate-spin text-brand-500" />
        <span>กำลังโหลด Monaco C++ Editor...</span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800/40 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded w-1/3" />
      </div>
    </div>
  )
}

export function CodeEditor({
  files,
  activeTabId,
  onSelectTab,
  onAddTab,
  onDeleteTab,
  onRenameTab,
  onChangeCode,
  fontSize,
  onFontSizeChange,
  boardType,
  theme = 'dark'
}: CodeEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  const [monacoLoaded, setMonacoLoaded] = useState<boolean>(false)
  const [useFallback, setUseFallback] = useState<boolean>(false)

  // State for Add New Tab Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTabName, setNewTabName] = useState('')
  const [addError, setAddError] = useState('')

  // State for Rename Inline
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // State for Delete Confirm Modal
  const [deletingTab, setDeletingTab] = useState<CodeTab | null>(null)

  const activeTab = files.find((f) => f.id === activeTabId) || files[0]

  // Fallback timer if CDN takes too long or fails
  useEffect(() => {
    if (monacoLoaded) return
    const timer = setTimeout(() => {
      if (!monacoLoaded) {
        console.warn('Monaco Editor CDN load timeout, switching to Fallback Code Editor.')
        setUseFallback(true)
      }
    }, 4500)
    return () => clearTimeout(timer)
  }, [monacoLoaded])

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    setMonacoLoaded(true)
    setUseFallback(false)

    // Register custom C++ / Arduino autocomplete triggers in Thai
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const suggestions = [
          {
            label: 'fd(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'fd(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์เคลื่อนที่ไปข้างหน้าตามความเร็วที่กำหนด (-100 ถึง 100)',
            range
          },
          {
            label: 'fd2(speedL, speedR)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'fd2(${1:50}, ${2:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์เคลื่อนที่ไปข้างหน้า โดยแยกความเร็วล้อซ้ายและขวา (-100 ถึง 100)',
            range
          },
          {
            label: 'bk(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'bk(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์ถอยหลังตามความเร็วที่กำหนด (-100 ถึง 100)',
            range
          },
          {
            label: 'bk2(speedL, speedR)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'bk2(${1:50}, ${2:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์ถอยหลัง โดยแยกความเร็วล้อซ้ายและขวา (-100 ถึง 100)',
            range
          },
          {
            label: 'tl(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'tl(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์เลี้ยวซ้าย (ล้อซ้ายหยุด 0, ล้อขวาหมุนไปข้างหน้า)',
            range
          },
          {
            label: 'tr(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'tr(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์เลี้ยวขวา (ล้อซ้ายหมุนไปข้างหน้า, ล้อขวาหยุด 0)',
            range
          },
          {
            label: 'sl(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'sl(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์หมุนกลับตัวไปทางซ้าย (Spin Left)',
            range
          },
          {
            label: 'sr(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'sr(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'สั่งหุ่นยนต์หมุนกลับตัวไปทางขวา (Spin Right)',
            range
          },
          {
            label: 'ao()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'ao();',
            documentation: 'สั่งหยุดการทำงานของมอเตอร์ทั้งหมด (Stop All Motors)',
            range
          },
          {
            label: 'motor(channel, speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'motor(${1:1}, ${2:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'กำหนดความเร็วของมอเตอร์ตามช่องสัญญาณ (1-4) (-100 ถึง 100)',
            range
          },
          {
            label: 'analog(pin)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'analog(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'อ่านค่าเซนเซอร์อนาล็อกตามหมายเลขพิน (0-1023)',
            range
          },
          {
            label: 'in(pin)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'in(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'อ่านค่าเซนเซอร์ดิจิทัล (0 หรือ 1)',
            range
          },
          {
            label: 'gl(sensorIndex)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'gl(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'อ่านค่าความสว่างสะท้อนกลับจากเซนเซอร์ตรวจจับเส้น',
            range
          },
          {
            label: 'knob()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'knob()',
            documentation: 'อ่านค่าตำแหน่งลูกบิดวอลลุ่มปรับแต่ง (0-1023)',
            range
          },
          {
            label: 'delay(ms)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'delay(${1:1000});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'หน่วงเวลาการทำงาน (มิลลิวินาที)',
            range
          },
          {
            label: 'millis()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'millis()',
            documentation: 'คืนค่าเวลาเป็นมิลลิวินาทีนับตั้งแต่โปรแกรมเริ่มทำงาน',
            range
          },
          {
            label: 'map(value, fromLow, fromHigh, toLow, toHigh)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'map(${1:val}, ${2:0}, ${3:1023}, ${4:0}, ${5:100})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'แปลงช่วงของตัวเลขจากช่วงหนึ่งไปยังอีกช่วงหนึ่ง',
            range
          },
          {
            label: 'constrain(amt, low, high)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'constrain(${1:val}, ${2:0}, ${3:100})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'จำกัดช่วงค่าของตัวเลขไม่ให้เกินขอบเขตต่ำสุดและสูงสุด',
            range
          },
          {
            label: 'abs(x)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'abs(${1:x})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'คำนวณค่าสัมบูรณ์ของตัวเลข (Absolute Value)',
            range
          },
          {
            label: 'min(a, b)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'min(${1:a}, ${2:b})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'หาค่าต่ำสุดระหว่างตัวเลขสองค่า',
            range
          },
          {
            label: 'max(a, b)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'max(${1:a}, ${2:b})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'หาค่าสูงสุดระหว่างตัวเลขสองค่า',
            range
          }
        ]

        return { suggestions }
      }
    })
  }

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize })
    }
  }, [fontSize])

  const handleOpenAddModal = () => {
    setNewTabName('')
    setAddError('')
    setIsAddModalOpen(true)
  }

  const handleConfirmAddTab = () => {
    let rawName = newTabName.trim()
    if (!rawName) {
      setAddError('กรุณาระบุชื่อไฟล์')
      return
    }

    // Auto append .ino if no extension provided
    if (!rawName.includes('.')) {
      rawName += '.ino'
    }

    const isDuplicate = files.some(
      (f) => f.name.toLowerCase() === rawName.toLowerCase()
    )
    if (isDuplicate) {
      setAddError(`ไฟล์ชื่อ "${rawName}" มีอยู่แล้วในโปรเจกต์`)
      return
    }

    onAddTab(rawName)
    setIsAddModalOpen(false)
    setNewTabName('')
    setAddError('')
  }

  const handleStartRename = (tab: CodeTab, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTabId(tab.id)
    setEditingName(tab.name)
  }

  const handleSaveRename = (tabId: string) => {
    let finalName = editingName.trim()
    if (!finalName) {
      setEditingTabId(null)
      return
    }
    if (!finalName.includes('.')) {
      finalName += '.ino'
    }

    const isDuplicate = files.some(
      (f) => f.id !== tabId && f.name.toLowerCase() === finalName.toLowerCase()
    )
    if (!isDuplicate) {
      onRenameTab(tabId, finalName)
    }
    setEditingTabId(null)
  }

  const handleConfirmDelete = () => {
    if (deletingTab) {
      onDeleteTab(deletingTab.id)
      setDeletingTab(null)
    }
  }

  // Calculate lines for fallback editor
  const currentCode = activeTab ? activeTab.code : ''
  const lineCount = currentCode.split('\n').length
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-900 select-none font-sans transition-colors duration-300">
      {/* 1. Arduino IDE Style Multi-Tab Header Bar */}
      <div className="h-10 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 shrink-0 gap-2 overflow-hidden">
        {/* Scrollable Tabs List */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 flex-1">
          {files.map((tab) => {
            const isActive = tab.id === activeTabId
            const isEditing = editingTabId === tab.id
            const isMain = tab.isMain || tab.name === 'main.ino'

            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                onDoubleClick={(e) => handleStartRename(tab, e)}
                className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-mono transition cursor-pointer shrink-0 border-t border-x ${
                  isActive
                    ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-300 border-slate-300 dark:border-slate-800 font-semibold shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-300/80 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                {tab.name.endsWith('.ino') ? (
                  <FileCode
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                ) : (
                  <Code
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-teal-500 dark:text-teal-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                )}

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(tab.id)
                        if (e.key === 'Escape') setEditingTabId(null)
                      }}
                      onBlur={() => handleSaveRename(tab.id)}
                      autoFocus
                      className="bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-200 px-1.5 py-0.5 rounded-lg border border-brand-500 outline-none text-xs w-24 font-mono"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveRename(tab.id)
                      }}
                      className="text-emerald-500 hover:text-emerald-400"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{tab.name}</span>
                    {isMain && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800/50 font-sans font-semibold">
                        หลัก
                      </span>
                    )}
                  </>
                )}

                {/* Edit Button on Hover */}
                {!isEditing && (
                  <button
                    onClick={(e) => handleStartRename(tab, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition p-0.5 rounded"
                    title="เปลี่ยนชื่อไฟล์ (Rename)"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}

                {/* Delete Tab Button */}
                {files.length > 1 && !isMain && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingTab(tab)
                    }}
                    className={`p-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 transition ${
                      isActive ? 'text-slate-400' : 'text-slate-500 opacity-60 group-hover:opacity-100'
                    }`}
                    title="ลบแท็บ (Delete Tab)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Active Underline Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-full" />
                )}
              </div>
            )
          })}

          {/* New Tab Button (+) */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-slate-200/80 hover:bg-brand-100 dark:bg-slate-800/60 dark:hover:bg-brand-950/60 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-300/80 dark:border-slate-700/60 hover:border-brand-400 transition-all shrink-0 font-mono font-medium"
            title="เพิ่ม Tab โค้ดใหม่"
          >
            <Plus className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Tab</span>
          </button>
        </div>

        {/* Right Controls: Font Size & Monaco Retry */}
        <div className="flex items-center gap-2 shrink-0">
          {useFallback && (
            <button
              onClick={() => setUseFallback(false)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-all"
              title="ลองโหลด Monaco Editor อีกครั้ง"
            >
              <RefreshCw className="w-3 h-3 text-brand-500" /> โหลด Monaco อีกครั้ง
            </button>
          )}

          {/* Font Adjuster */}
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 px-2 py-0.5 rounded-xl border border-slate-300/80 dark:border-slate-800 text-xs">
            <Type className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] min-w-[26px] text-center font-semibold">
              {fontSize}px
            </span>
            <button
              onClick={() => onFontSizeChange((prev) => Math.min(32, prev + 2))}
              title="เพิ่มขนาดฟอนต์ (A+)"
              className="p-1 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFontSizeChange((prev) => Math.max(10, prev - 2))}
              title="ลดขนาดฟอนต์ (A-)"
              className="p-1 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFontSizeChange(14)}
              title="รีเซ็ตขนาดฟอนต์เป็น 14px"
              className="p-1 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Editor Container */}
      <div className="flex-1 w-full overflow-hidden relative">
        {useFallback ? (
          /* Fallback Textarea Editor */
          <div className="w-full h-full flex bg-slate-50 dark:bg-slate-950 font-mono overflow-auto">
            <div
              className="select-none px-3 py-3 text-slate-400 dark:text-slate-600 bg-slate-200/50 dark:bg-slate-900/40 text-right border-r border-slate-300 dark:border-slate-800/80"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
            >
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>
            <textarea
              value={currentCode}
              onChange={(e) => onChangeCode(activeTab.id, e.target.value)}
              spellCheck={false}
              className="flex-1 w-full h-full p-3 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.5', tabSize: 2 }}
            />
          </div>
        ) : (
          /* Monaco Editor */
          <Editor
            key={`${activeTab.id}-${theme}`}
            height="100%"
            defaultLanguage="cpp"
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            value={currentCode}
            onChange={(val) => onChangeCode(activeTab.id, val || '')}
            onMount={handleEditorMount}
            loading={<CodeEditorSkeleton />}
            options={{
              fontSize: fontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 12, bottom: 12 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on'
            }}
          />
        )}
      </div>

      {/* 3. Modal: Add New Tab */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                <FileCode className="w-5 h-5 text-brand-500" />
                <span>เพิ่ม Tab โค้ดใหม่ (New Sketch Tab)</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อไฟล์ / ชื่อ Tab:</label>
              <input
                type="text"
                placeholder="เช่น motor.ino หรือ sensor.h"
                value={newTabName}
                onChange={(e) => {
                  setNewTabName(e.target.value)
                  setAddError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmAddTab()
                }}
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-xl text-slate-900 dark:text-slate-100 outline-none font-mono text-xs transition-all"
              />

              {/* Quick Type Selectors */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">นามสกุลแนะนำ:</span>
                <button
                  type="button"
                  onClick={() => {
                    const base = newTabName.split('.')[0] || 'sub'
                    setNewTabName(`${base}.ino`)
                  }}
                  className="px-2.5 py-1 text-xs rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono font-medium transition"
                >
                  .ino
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = newTabName.split('.')[0] || 'header'
                    setNewTabName(`${base}.h`)
                  }}
                  className="px-2.5 py-1 text-xs rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono font-medium transition"
                >
                  .h
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = newTabName.split('.')[0] || 'helpers'
                    setNewTabName(`${base}.cpp`)
                  }}
                  className="px-2.5 py-1 text-xs rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-medium transition"
                >
                  .cpp
                </button>
              </div>

              {addError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAddTab}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-900/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>สร้าง Tab ใหม่</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Confirm Delete Tab */}
      {deletingTab && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold">ยืนยันการลบ Tab โค้ด</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              คุณต้องการลบไฟล์ <span className="font-mono text-brand-600 dark:text-brand-300 font-bold">{deletingTab.name}</span> ใช่หรือไม่?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingTab(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/20 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบไฟล์</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
