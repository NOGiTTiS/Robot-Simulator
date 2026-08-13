'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ResizableSplitProps {
  leftComponent: React.ReactNode
  rightComponent: React.ReactNode
  initialRatio?: number
  storageKey?: string
  minRatio?: number
  maxRatio?: number
  onResize?: () => void
  panelMode?: 'split' | 'editor' | 'simulator'
}

export function ResizableSplit({
  leftComponent,
  rightComponent,
  initialRatio = 35,
  storageKey = 'tunorth_editor_split_ratio',
  minRatio = 20,
  maxRatio = 80,
  onResize,
  panelMode = 'split'
}: ResizableSplitProps) {
  const [splitRatio, setSplitRatio] = useState<number>(initialRatio)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved ratio from LocalStorage on mount
  useEffect(() => {
    try {
      const savedRatio = localStorage.getItem(storageKey)
      if (savedRatio) {
        const parsed = parseFloat(savedRatio)
        if (!isNaN(parsed) && parsed >= minRatio && parsed <= maxRatio) {
          setSplitRatio(parsed)
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, minRatio, maxRatio])

  // Save ratio to LocalStorage
  const updateRatio = useCallback(
    (newRatio: number) => {
      const clamped = Math.min(maxRatio, Math.max(minRatio, newRatio))
      setSplitRatio(clamped)
      try {
        localStorage.setItem(storageKey, clamped.toString())
      } catch {
        // Ignore storage errors
      }
      if (onResize) {
        onResize()
      }
      // Trigger global resize event so Monaco Editor & Canvas update layout
      window.dispatchEvent(new Event('resize'))
    },
    [maxRatio, minRatio, storageKey, onResize]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const newRatio = (offsetX / rect.width) * 100
      updateRatio(newRatio)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || !e.touches[0]) return
      const rect = containerRef.current.getBoundingClientRect()
      const offsetX = e.touches[0].clientX - rect.left
      const newRatio = (offsetX / rect.width) * 100
      updateRatio(newRatio)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        window.dispatchEvent(new Event('resize'))
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseleave', handleMouseUp)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseUp)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, updateRatio])

  const handleDoubleClick = () => {
    updateRatio(50)
  }

  if (panelMode === 'editor') {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden relative select-none">
        {leftComponent}
      </div>
    )
  }

  if (panelMode === 'simulator') {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden relative select-none">
        {rightComponent}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-row overflow-hidden relative w-full h-full select-none"
    >
      {/* Left Pane (Code Editor) */}
      <div
        style={{ width: `${splitRatio}%` }}
        className="h-full flex flex-col min-w-50 overflow-hidden"
      >
        {leftComponent}
      </div>

      {/* Splitter Handle */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
        title="Drag to resize, double-click to reset (50/50)"
        className={`w-2 h-full cursor-col-resize flex items-center justify-center transition-colors z-10 shrink-0 group ${
          isDragging ? 'bg-cyan-500' : 'bg-slate-900 border-x border-slate-800 hover:bg-cyan-600/40'
        }`}
      >
        <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-cyan-300 transition-colors" />
      </div>

      {/* Right Pane (Simulator Canvas) */}
      <div
        style={{ width: `${100 - splitRatio}%` }}
        className="h-full flex flex-col min-w-50 overflow-hidden relative"
      >
        {rightComponent}
      </div>
    </div>
  )
}

