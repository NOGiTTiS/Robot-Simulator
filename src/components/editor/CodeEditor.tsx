'use client'

import { useRef, useEffect, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { Type, Plus, Minus, RotateCcw, FileCode, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'

interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  fontSize: number
  onFontSizeChange: (size: number | ((prev: number) => number)) => void
  boardType: string
}

function CodeEditorSkeleton() {
  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-4 font-mono select-none animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-slate-800/60 rounded w-1/3" />
        <div className="h-4 bg-slate-800/40 rounded w-1/2" />
        <div className="h-4 bg-slate-800/30 rounded w-2/3" />
        <div className="h-4 bg-slate-800/50 rounded w-2/5" />
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-cyan-400/80 bg-slate-900/60 py-2 rounded-lg border border-cyan-900/30">
        <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
        <span>กำลังโหลด Monaco C++ Editor...</span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-800/40 rounded w-1/4" />
        <div className="h-4 bg-slate-800/50 rounded w-1/3" />
      </div>
    </div>
  )
}

export function CodeEditor({
  code,
  onChange,
  fontSize,
  onFontSizeChange,
  boardType
}: CodeEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  const [monacoLoaded, setMonacoLoaded] = useState<boolean>(false)
  const [useFallback, setUseFallback] = useState<boolean>(false)

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

    // Register custom C++ / Arduino autocomplete triggers
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
            documentation: 'Move robot forward with speed (-100 to 100)',
            range
          },
          {
            label: 'bk(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'bk(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Move robot backward with speed (-100 to 100)',
            range
          },
          {
            label: 'tl(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'tl(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Turn left (Left wheel stops 0, Right wheel speed)',
            range
          },
          {
            label: 'tr(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'tr(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Turn right (Left wheel speed, Right wheel stops 0)',
            range
          },
          {
            label: 'sl(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'sl(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Spin left (Left wheel backward -speed, Right wheel forward speed)',
            range
          },
          {
            label: 'sr(speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'sr(${1:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Spin right (Left wheel forward speed, Right wheel backward -speed)',
            range
          },
          {
            label: 'ao()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'ao();',
            documentation: 'Stop all motors',
            range
          },
          {
            label: 'motor(channel, speed)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'motor(${1:1}, ${2:50});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Set motor channel (1-4) speed (-100 to 100)',
            range
          },
          {
            label: 'analog(pin)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'analog(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Read analog sensor value from pin (0-1023)',
            range
          },
          {
            label: 'in(pin)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'in(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Read digital sensor value (0 or 1)',
            range
          },
          {
            label: 'gl(sensorIndex)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'gl(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get line sensor raw reading',
            range
          },
          {
            label: 'knob()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'knob()',
            documentation: 'Read potentiometer knob value (0-1023)',
            range
          },
          {
            label: 'delay(ms)',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'delay(${1:1000});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Pause execution for specified milliseconds',
            range
          },
          {
            label: 'millis()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'millis()',
            documentation: 'Returns milliseconds since program start',
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

  // Calculate lines for fallback editor
  const lineCount = code.split('\n').length
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 border-r border-slate-900">
      {/* Editor Sub-Header Toolbar */}
      <div className="h-9 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">main.cpp</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {boardType} C++
          </span>
          {useFallback && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Basic Mode
            </span>
          )}
        </div>

        {/* Toolbar Right Controls */}
        <div className="flex items-center gap-2">
          {useFallback && (
            <button
              onClick={() => {
                setUseFallback(false)
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
              title="ลองโหลด Monaco Editor อีกครั้ง"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" /> Retry Monaco
            </button>
          )}

          {/* Font Adjuster Bar */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-xs">
            <Type className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-slate-300 text-[11px] min-w-[28px] text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => onFontSizeChange((prev) => Math.min(32, prev + 2))}
              title="Increase Font Size (A+)"
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFontSizeChange((prev) => Math.max(10, prev - 2))}
              title="Decrease Font Size (A-)"
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFontSizeChange(14)}
              title="Reset Font Size to 14px"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 w-full overflow-hidden relative">
        {useFallback ? (
          /* Fallback Textarea Editor for Offline / Slow CDN */
          <div className="w-full h-full flex bg-slate-950 font-mono overflow-auto">
            {/* Line Numbers */}
            <div
              className="select-none px-3 py-3 text-slate-600 bg-slate-900/40 text-right border-r border-slate-800/80"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
            >
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>
            {/* Editable Text Area */}
            <textarea
              value={code}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full h-full p-3 bg-transparent text-slate-100 focus:outline-none resize-none font-mono"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.5', tabSize: 2 }}
            />
          </div>
        ) : (
          /* Monaco Editor */
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={(val) => onChange(val || '')}
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
    </div>
  )
}
