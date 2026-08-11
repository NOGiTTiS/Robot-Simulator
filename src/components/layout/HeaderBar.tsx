'use client'

import { Cpu, Map, Play, Pause, RotateCcw, Box, Monitor, Download, Upload, Zap, Sliders, ChevronDown } from 'lucide-react'
import { MapDefinition } from '@/types/project'

interface HeaderBarProps {
  boardType: string
  onBoardChange: (board: string) => void
  mapId: string
  onMapChange: (map: string) => void
  customMaps?: MapDefinition[]
  onOpenMapSelectModal?: () => void
  onOpenCustomMapModal?: () => void
  onOpenSensorModal?: () => void
  isRunning: boolean
  onToggleRun: () => void
  onReset: () => void
  speedMultiplier: number
  onSpeedChange: (speed: number) => void
  viewMode: '2D' | '3D'
  onViewModeChange: (mode: '2D' | '3D') => void
  fontSize: number
  onFontSizeChange: (size: number | ((prev: number) => number)) => void
  onExport: (format?: 'ino' | 'cpp') => void
  onImport: () => void
}

export function HeaderBar({
  boardType,
  onBoardChange,
  mapId,
  onMapChange,
  customMaps = [],
  onOpenMapSelectModal,
  onOpenCustomMapModal,
  onOpenSensorModal,
  isRunning,
  onToggleRun,
  onReset,
  speedMultiplier,
  onSpeedChange,
  viewMode,
  onViewModeChange,
  fontSize,
  onFontSizeChange,
  onExport,
  onImport
}: HeaderBarProps) {
  const boards = [
    { id: 'ATOM-VX', name: 'PT-BOT ATOM-VX' },
    { id: 'POP32i', name: 'POP32 / POP32i' },
    { id: 'NANO', name: 'Arduino Nano' },
    { id: 'ESP32', name: 'ESP32 Board' }
  ]

  const builtinMaps = [
    { id: 'athletics-280x160', name: 'Athletics (280x160cm)' },
    { id: 'rt-td-122x244', name: 'RT-TD Field (122x244cm)' },
    { id: 'robot-120x240', name: 'Robot Field (120x240cm)' },
    { id: 'wall-line-track', name: 'Wall Line Track' },
    { id: 'qbd-field', name: 'QBD Field' },
    { id: 'line-junior', name: 'Programmable Line Junior' }
  ]

  const speeds = [1, 2, 5]

  return (
    <header className="h-14 glass-header px-4 flex items-center justify-between gap-3 text-slate-200 z-20 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5 min-w-max">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              TUNorth Robot Simulator
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              v1.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">โรงเรียนเตรียมอุดมศึกษาภาคเหนือ</p>
        </div>
      </div>

      {/* Selectors Section */}
      <div className="flex items-center gap-2">
        {/* Board Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={boardType}
            onChange={(e) => onBoardChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map Selector Modal Button */}
        <button
          onClick={onOpenMapSelectModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-200 hover:text-emerald-300 transition group"
          title="Select Competition Map"
        >
          <Map className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="max-w-[150px] truncate">
            {customMaps.find((m) => m.id === mapId)?.name || builtinMaps.find((m) => m.id === mapId)?.name || 'Select Map'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 shrink-0" />
        </button>

        {/* Sensors Configurator Modal Button */}
        <button
          onClick={onOpenSensorModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-300 hover:text-emerald-300 transition"
          title="Configure Sensors"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sensors</span>
        </button>
      </div>

      {/* Main Simulation Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Run / Pause Button */}
        <button
          onClick={onToggleRun}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-emerald-950/40'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-amber-300" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          title="Reset Simulation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80 hover:text-white transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {/* Speed Multipliers */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition ${
                speedMultiplier === s
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Editor Font & View Toggle Section */}
      <div className="flex items-center gap-2">
        {/* Editor Font Size Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg px-1.5 py-1 border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-1 font-mono">{fontSize}px</span>
          <button
            onClick={() => onFontSizeChange((prev) => Math.min(32, prev + 2))}
            title="Increase Font Size (A+)"
            className="px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            A+
          </button>
          <button
            onClick={() => onFontSizeChange((prev) => Math.max(10, prev - 2))}
            title="Decrease Font Size (A-)"
            className="px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            A-
          </button>
          <button
            onClick={() => onFontSizeChange(14)}
            title="Reset Font Size (14px)"
            className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200 transition"
          >
            Reset
          </button>
        </div>

        {/* 2D / 3D Toggle */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => onViewModeChange('2D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === '2D'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>2D</span>
          </button>
          <button
            onClick={() => onViewModeChange('3D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === '3D'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
        </div>

        {/* Import & Export */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
          <button
            onClick={onImport}
            title="Import .ino / .cpp file"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <div className="group relative">
            <button
              onClick={() => onExport('ino')}
              title="Export code (.ino)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-xl z-50 min-w-max text-xs">
              <button
                onClick={() => onExport('ino')}
                className="px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded flex items-center gap-2"
              >
                <span>Export as .ino (Arduino)</span>
              </button>
              <button
                onClick={() => onExport('cpp')}
                className="px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded flex items-center gap-2"
              >
                <span>Export as .cpp (C++)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

