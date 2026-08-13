'use client'

import {
  Layers,
  Bot,
  Navigation,
  Gauge,
  Activity,
  AlertTriangle,
  Sliders,
  Map as MapIcon,
  RotateCcw,
  RotateCw,
  Compass,
  Eye,
  EyeOff,
  Route,
  Trash2
} from 'lucide-react'
import { Canvas2DRenderer } from './Canvas2DRenderer'
import { Canvas3DRenderer } from './Canvas3DRenderer'
import { ExtendedPhysicsState } from '@/lib/physics/kinematics'
import { MapDefinition, SensorConfigItem, RobotSpec } from '@/types/project'
import { HardwareState } from '@/lib/interpreter/boards'
import { useSensorSampler } from '@/lib/physics/mapSampler'

interface SimulatorContainerProps {
  viewMode: '2D' | '3D'
  mapDef: MapDefinition
  boardType: string
  robotSpec?: RobotSpec
  isRunning: boolean
  physicsState: ExtendedPhysicsState
  trailPath: { x: number; y: number }[]
  showSensorsOverlay?: boolean
  showTrail?: boolean
  onToggleSensorsOverlay?: () => void
  onToggleTrail?: () => void
  onClearTrail?: () => void
  sensors?: SensorConfigItem[]
  hwState?: HardwareState
  onOpenSensorConfig?: () => void
  onOpenMapModal?: () => void
  onRepositionRobot?: (x: number, y: number) => void
  onRotateRobot?: (deltaDeg: number, absoluteDeg?: number) => void
  theme?: 'dark' | 'light'
}

export function SimulatorContainer({
  viewMode,
  mapDef,
  boardType,
  robotSpec,
  isRunning,
  physicsState,
  trailPath,
  showSensorsOverlay = true,
  showTrail = true,
  onToggleSensorsOverlay,
  onToggleTrail,
  onClearTrail,
  sensors = [],
  hwState,
  onOpenSensorConfig,
  onOpenMapModal,
  onRepositionRobot,
  onRotateRobot,
  theme = 'dark'
}: SimulatorContainerProps) {
  // Continuous sensor sampler hook (updates hardware state in both 2D and 3D mode)
  useSensorSampler(physicsState, mapDef, sensors, hwState)

  // Convert radians to degrees [-180, 180]
  const headingDeg = Math.round((physicsState.heading * 180) / Math.PI)
  const posXCm = (physicsState.x / 10).toFixed(1)
  const posYCm = (physicsState.y / 10).toFixed(1)
  const speedCmS = (physicsState.linearVelocity / 10).toFixed(1)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 relative overflow-hidden select-none font-sans transition-colors duration-300">
      {/* Canvas Top Telemetry & Controls Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Left Badge: View Mode & Visual Overlays (Sensors Overlay & Motion Trail) */}
        <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto shadow-lg text-xs font-medium">
          <Layers className="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            มุมมอง {viewMode} &bull; {mapDef.name}
          </span>
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isRunning ? 'bg-emerald-500 shadow-xs shadow-emerald-500' : 'bg-amber-500'
            }`}
          />

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Toggle Sensor Overlay Display */}
          {onToggleSensorsOverlay && (
            <button
              onClick={onToggleSensorsOverlay}
              className={`p-1 px-2.5 rounded-xl transition flex items-center gap-1.5 text-[11px] font-semibold ${
                showSensorsOverlay
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800/60'
              }`}
              title={showSensorsOverlay ? 'เปิดการแสดงผลเซนเซอร์ (กดเพื่อซ่อน)' : 'ซ่อนการแสดงผลเซนเซอร์ (กดเพื่อแสดง)'}
            >
              {showSensorsOverlay ? <Eye className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>เซนเซอร์</span>
            </button>
          )}

          {/* Toggle Motion Trail Display */}
          {onToggleTrail && (
            <button
              onClick={onToggleTrail}
              className={`p-1 px-2.5 rounded-xl transition flex items-center gap-1.5 text-[11px] font-semibold ${
                showTrail
                  ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800/60'
              }`}
              title={showTrail ? 'เปิดการแสดงผลเส้นทางการวิ่ง (กดเพื่อซ่อน)' : 'ซ่อนการแสดงผลเส้นทางการวิ่ง (กดเพื่อแสดง)'}
            >
              <Route className={`w-3.5 h-3.5 ${showTrail ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400'}`} />
              <span>เส้นทาง</span>
            </button>
          )}

          {/* Clear Trail Button */}
          {onClearTrail && trailPath.length > 0 && (
            <button
              onClick={onClearTrail}
              className="p-1 px-2 rounded-xl transition text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1"
              title="ลบจุดเส้นทางการวิ่งสะสม (Clear Trail)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center/Right Badge: Real-time Telemetry */}
        <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto text-xs font-mono text-slate-700 dark:text-slate-300 shadow-lg">
          <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-sans">
            <Bot className="w-3.5 h-3.5" />
            <span className="font-bold text-slate-900 dark:text-slate-100">{boardType}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Position */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-sans">พิกัด:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{posXCm}</span>
            <span className="text-slate-400">,</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{posYCm}</span>
            <span className="text-slate-500 font-sans">ซม.</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Heading */}
          <div className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-brand-500 dark:text-brand-300 inline transition-transform duration-200" style={{ transform: `rotate(${headingDeg}deg)` }} />
            <span className="text-slate-500 font-sans">มุม:</span>
            <span className="text-brand-600 dark:text-brand-300 font-bold">{headingDeg}&deg;</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Speed */}
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-bold">{speedCmS} ซม./วิ</span>
          </div>

          {/* Slip Warning */}
          {physicsState.slipRatio > 0.05 && (
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-800/60 animate-pulse font-sans">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-bold">ลื่นไถล</span>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area: 2D Canvas or 3D WebGL Scene */}
      <div className="flex-1 w-full h-full relative">
        {viewMode === '2D' ? (
          <Canvas2DRenderer
            physicsState={physicsState}
            mapDef={mapDef}
            boardType={boardType}
            robotSpec={robotSpec}
            trailPath={trailPath}
            showSensorsOverlay={showSensorsOverlay}
            showTrail={showTrail}
            sensors={sensors}
            hwState={hwState}
            onRepositionRobot={onRepositionRobot}
            theme={theme}
          />
        ) : (
          <Canvas3DRenderer
            physicsState={physicsState}
            mapDef={mapDef}
            boardType={boardType}
            robotSpec={robotSpec}
            trailPath={trailPath}
            showSensorsOverlay={showSensorsOverlay}
            showTrail={showTrail}
            sensors={sensors}
            hwState={hwState}
            onRepositionRobot={onRepositionRobot}
            theme={theme}
          />
        )}
      </div>

      {/* Bottom Floating Controls: Wheel Telemetry (Left) & Robot Rotation Toolbar (Right) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Wheel Encoders Telemetry Bar */}
        <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1 font-sans">
            <Activity className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-slate-500 font-semibold">ล้อซ้าย/ขวา:</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans">ความเร็ว: </span>
            <span className="text-brand-600 dark:text-brand-300 font-bold">{Math.round(physicsState.leftWheelSpeed)}</span>
            <span className="text-slate-400"> / </span>
            <span className="text-brand-600 dark:text-brand-300 font-bold">{Math.round(physicsState.rightWheelSpeed)}</span>
            <span className="text-slate-500 font-sans"> มม./วิ</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div>
            <span className="text-slate-500 font-sans">ระยะทาง: </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(physicsState.leftEncoder)}</span>
            <span className="text-slate-400"> / </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(physicsState.rightEncoder)}</span>
            <span className="text-slate-500 font-sans"> มม.</span>
          </div>
        </div>

        {/* Right: Interactive Robot Rotation Control Toolbar */}
        {onRotateRobot && (
          <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg pointer-events-auto text-xs font-sans">
            <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold mr-1">
              <Compass className="w-4 h-4" />
              <span className="text-xs">หมุน:</span>
            </div>

            {/* Step Rotate Buttons */}
            <button
              onClick={() => onRotateRobot(-90)}
              title="หมุนซ้าย -90°"
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-950/80 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono transition-all text-[11px] font-semibold flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" /> -90&deg;
            </button>
            <button
              onClick={() => onRotateRobot(-15)}
              title="หมุนซ้าย -15°"
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-950/80 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono transition-all text-[11px] font-semibold"
            >
              -15&deg;
            </button>

            <button
              onClick={() => onRotateRobot(15)}
              title="หมุนขวา +15°"
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-950/80 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono transition-all text-[11px] font-semibold"
            >
              +15&deg;
            </button>
            <button
              onClick={() => onRotateRobot(90)}
              title="หมุนขวา +90°"
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-950/80 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono transition-all text-[11px] font-semibold flex items-center gap-0.5"
            >
              +90&deg; <RotateCw className="w-3 h-3" />
            </button>

            <span className="text-slate-300 dark:text-slate-700 mx-0.5">|</span>

            {/* Quick Presets */}
            <button
              onClick={() => onRotateRobot(0, 0)}
              title="หันหน้าทิศตะวันออก (0°)"
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all font-bold ${
                headingDeg === 0
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              0&deg;
            </button>
            <button
              onClick={() => onRotateRobot(0, 90)}
              title="หันหน้าทิศเหนือ (90°)"
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all font-bold ${
                headingDeg === 90
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              90&deg;
            </button>
            <button
              onClick={() => onRotateRobot(0, 180)}
              title="หันหน้าทิศตะวันตก (180°)"
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all font-bold ${
                Math.abs(headingDeg) === 180
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              180&deg;
            </button>

            {/* Angle Slider Input */}
            <input
              type="range"
              min="-180"
              max="180"
              value={headingDeg}
              onChange={(e) => onRotateRobot(0, Number(e.target.value))}
              className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 ml-1"
              title="ปรับแต่งมุมทิศทางหุ่นยนต์ (-180° ถึง 180°)"
            />
          </div>
        )}
      </div>
    </div>
  )
}
