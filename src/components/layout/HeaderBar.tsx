'use client'

import {
  Cpu,
  Map,
  Play,
  Pause,
  RotateCcw,
  Box,
  Monitor,
  Download,
  Upload,
  Zap,
  Sliders,
  ChevronDown,
  Bot,
  Maximize2,
  Minimize2,
  Columns,
  Code2,
  Tv,
  Sun,
  Moon,
  BookOpen,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react'
import { MapDefinition } from '@/types/project'
import { BUILTIN_MAPS } from '@/lib/maps'

interface HeaderBarProps {
  boardType?: string
  onBoardChange?: (board: string) => void
  robotName?: string
  onOpenRobotModal?: () => void
  mapId: string
  onMapChange: (map: string) => void
  customMaps?: MapDefinition[]
  onOpenMapSelectModal?: () => void
  onOpenCustomMapModal?: () => void
  onOpenSensorModal?: () => void
  onOpenCodeTemplatesModal?: () => void
  isRunning: boolean
  onToggleRun: () => void
  onReset: () => void
  speedMultiplier: number
  onSpeedChange: (speed: number) => void
  viewMode: '2D' | '3D'
  onViewModeChange: (mode: '2D' | '3D') => void
  onExport: (format?: 'ino' | 'cpp') => void
  onImport: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  panelMode: 'split' | 'editor' | 'simulator'
  onPanelModeChange: (mode: 'split' | 'editor' | 'simulator') => void
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
  isMuted?: boolean
  onToggleMute?: () => void
  isSmallScreen?: boolean
  onOpenSmallScreenNotice?: () => void
}

export function HeaderBar({
  boardType,
  robotName = 'ATOM-VX Standard',
  onOpenRobotModal,
  mapId,
  customMaps = [],
  onOpenMapSelectModal,
  onOpenSensorModal,
  onOpenCodeTemplatesModal,
  isRunning,
  onToggleRun,
  onReset,
  speedMultiplier,
  onSpeedChange,
  viewMode,
  onViewModeChange,
  onExport,
  onImport,
  isFullscreen,
  onToggleFullscreen,
  panelMode,
  onPanelModeChange,
  theme = 'dark',
  onToggleTheme,
  isMuted = false,
  onToggleMute,
  isSmallScreen = false,
  onOpenSmallScreenNotice
}: HeaderBarProps) {
  const speeds = [1, 2, 5]

  const activeMapName = customMaps.find((m) => m.id === mapId)?.name || BUILTIN_MAPS.find((m) => m.id === mapId)?.name || 'สนามมาตรฐาน'

  return (
    <header className="h-14 glass-header px-3 md:px-4 flex items-center justify-between gap-2 md:gap-3 text-slate-800 dark:text-slate-200 z-20 shrink-0 select-none border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 font-sans overflow-x-auto no-scrollbar">
      {/* 1. Brand & Logo */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0 min-w-max">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-brand-500 p-0.5 overflow-hidden flex items-center justify-center shadow-md shadow-brand-500/30 ring-2 ring-brand-400/40">
          <img src="/logo.png" alt="TUNorth Robot Logo" className="w-full h-full object-contain rounded-lg" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs md:text-sm bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 dark:from-white dark:via-brand-200 dark:to-brand-400 bg-clip-text text-transparent tracking-tight">
              TUNorth Robot Simulator
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800/50 font-semibold">
              v1.0
            </span>
            {isSmallScreen && (
              <button
                onClick={onOpenSmallScreenNotice}
                className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                title="คลิกเพื่อดูคำแนะนำขนาดหน้าจอ"
              >
                <Smartphone className="w-3 h-3 animate-pulse" />
                <span>หน้าจอเล็ก</span>
              </button>
            )}
          </div>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ</p>
        </div>
      </div>

      {/* 2. Selectors Section (Robot, Map, Sensors) */}
      <div className="flex items-center gap-1.5">
        {/* Robot Spec / Management Modal Button */}
        <button
          onClick={onOpenRobotModal}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-300 transition-all shadow-xs group flex items-center gap-1.5 font-semibold text-xs"
          title={`เลือกหุ่นยนต์ (${robotName} - ${boardType || 'บอร์ดควบคุม'})`}
        >
          <Bot className="w-4 h-4 text-brand-500 dark:text-brand-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">หุ่นยนต์</span>
        </button>

        {/* Map Selector Modal Button */}
        <button
          onClick={onOpenMapSelectModal}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-xs group flex items-center gap-1.5 font-semibold text-xs"
          title={`เลือกสนามแข่งขัน (${activeMapName})`}
        >
          <Map className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">สนาม</span>
        </button>

        {/* Sensors Configurator Modal Button */}
        <button
          onClick={onOpenSensorModal}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-xs flex items-center gap-1.5 font-semibold text-xs"
          title="เลือกและปรับแต่งตำแหน่งเซนเซอร์"
        >
          <Sliders className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="hidden sm:inline">เซนเซอร์</span>
        </button>
      </div>

      {/* 3. Main Simulation Execution Controls */}
      <div className="flex items-center gap-2">
        {/* Run / Pause Button */}
        <button
          onClick={onToggleRun}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-900/20'
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-900/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>หยุดชั่วคราว</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>เริ่มทำงาน</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          title="รีเซ็ตการจำลองหุ่นยนต์"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ต</span>
        </button>

        {/* Speed Multipliers */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                speedMultiplier === s
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 4. Layout, View Mode, Files & Fullscreen Section */}
      <div className="flex items-center gap-2">
        {/* Panel Layout Mode Selector (Split / Code / Sim) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onPanelModeChange('split')}
            title="แสดงผลแบ่งหน้าจอ (โค้ด + สนามจำลอง)"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
              panelMode === 'split'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPanelModeChange('editor')}
            title="แสดงผลหน้าต่างโค้ดเต็มหน้าจอ"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
              panelMode === 'editor'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPanelModeChange('simulator')}
            title="แสดงผลสนามจำลองเต็มหน้าจอ"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
              panelMode === 'simulator'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>

        {/* 2D / 3D View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onViewModeChange('2D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2D'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>2D</span>
          </button>
          <button
            onClick={() => onViewModeChange('3D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3D'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
        </div>

        {/* Import & Export */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={onImport}
            title="นำเข้าไฟล์โค้ด (.ino / .cpp)"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
          </button>

          <div className="group relative">
            <button
              onClick={() => onExport('ino')}
              title="ส่งออกไฟล์โค้ด (.ino)"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-xl z-50 min-w-max text-xs font-medium">
              <button
                onClick={() => onExport('ino')}
                className="px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-300 rounded-lg flex items-center gap-2 transition-all"
              >
                <span>ส่งออกไฟล์ .ino (Arduino)</span>
              </button>
              <button
                onClick={() => onExport('cpp')}
                className="px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-300 rounded-lg flex items-center gap-2 transition-all"
              >
                <span>ส่งออกไฟล์ .cpp (C++)</span>
              </button>
            </div>
          </div>

          {/* FullScreen Mode Toggle Button */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'ออกจากโหมดเต็มหน้าจอ (Esc)' : 'เข้าสู่โหมดเต็มหน้าจอ'}
            className={`p-2 rounded-xl transition-all flex items-center gap-1 ${
              isFullscreen
                ? 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Audio Mute / Unmute Toggle Button */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              title={isMuted ? 'เปิดเสียงสังเคราะห์ Buzzer (Unmute)' : 'ปิดเสียงสังเคราะห์ Buzzer (Mute)'}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 border ${
                isMuted
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              )}
            </button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          {onToggleTheme && (
            <button
              id="themeToggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'เปลี่ยนเป็น Light Mode (โหมดสว่าง)' : 'เปลี่ยนเป็น Dark Mode (โหมดมืด)'}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95 ml-1"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-brand-300 fill-brand-300" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}



