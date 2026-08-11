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
  onRotateRobot
}: SimulatorContainerProps) {
  // Continuous sensor sampler hook (updates hardware state in both 2D and 3D mode)
  useSensorSampler(physicsState, mapDef, sensors, hwState)

  // Convert radians to degrees [-180, 180]
  const headingDeg = Math.round((physicsState.heading * 180) / Math.PI)
  const posXCm = (physicsState.x / 10).toFixed(1)
  const posYCm = (physicsState.y / 10).toFixed(1)
  const speedCmS = (physicsState.linearVelocity / 10).toFixed(1)

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 relative overflow-hidden select-none">
      {/* Canvas Top Telemetry & Controls Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Left Badge: View Mode, Map Selector, Sensor Visuals & Trail Toggles */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">
            {viewMode} View &bull; {mapDef.name}
          </span>
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isRunning ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-500'
            }`}
          />

          {onOpenMapModal && (
            <button
              onClick={onOpenMapModal}
              className="ml-1 p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-md transition flex items-center gap-1 text-[11px] font-medium"
              title="Upload / Change Competition Map"
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
          )}

          {onOpenSensorConfig && (
            <button
              onClick={onOpenSensorConfig}
              className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-md transition flex items-center gap-1 text-[11px] font-medium"
              title="Open Interactive Sensor Configurator"
            >
              <Sliders className="w-3.5 h-3.5" /> Sensors ({sensors.filter((s) => s.enabled).length})
            </button>
          )}

          <span className="text-slate-700">|</span>

          {/* Toggle Sensor Overlay Display */}
          {onToggleSensorsOverlay && (
            <button
              onClick={onToggleSensorsOverlay}
              className={`p-1 px-1.5 rounded-md transition flex items-center gap-1 text-[11px] font-medium ${
                showSensorsOverlay
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-500 hover:text-slate-300 bg-slate-800/40'
              }`}
              title={showSensorsOverlay ? 'เปิดการแสดงผลเซนเซอร์ (กดเพื่อซ่อน)' : 'ซ่อนการแสดงผลเซนเซอร์ (กดเพื่อแสดง)'}
            >
              {showSensorsOverlay ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>Sensors UI</span>
            </button>
          )}

          {/* Toggle Motion Trail Display */}
          {onToggleTrail && (
            <button
              onClick={onToggleTrail}
              className={`p-1 px-1.5 rounded-md transition flex items-center gap-1 text-[11px] font-medium ${
                showTrail
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-500 hover:text-slate-300 bg-slate-800/40'
              }`}
              title={showTrail ? 'เปิดการแสดงผลเส้นทางการวิ่ง (กดเพื่อซ่อน)' : 'ซ่อนการแสดงผลเส้นทางการวิ่ง (กดเพื่อแสดง)'}
            >
              <Route className={`w-3.5 h-3.5 ${showTrail ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>Trail</span>
            </button>
          )}

          {/* Clear Trail Button */}
          {onClearTrail && trailPath.length > 0 && (
            <button
              onClick={onClearTrail}
              className="p-1 px-1.5 rounded-md transition text-slate-400 hover:text-rose-300 hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1"
              title="ลบจุดเส้นทางการวิ่งสะสม (Clear Trail)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center/Right Badge: Real-time Telemetry */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 pointer-events-auto text-xs font-mono text-slate-300 shadow-lg">
          <div className="flex items-center gap-1 text-cyan-400">
            <Bot className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-200">{boardType}</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Position */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Pos:</span>
            <span className="text-emerald-400 font-semibold">{posXCm}</span>
            <span className="text-slate-500">,</span>
            <span className="text-emerald-400 font-semibold">{posYCm}</span>
            <span className="text-slate-500">cm</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Heading */}
          <div className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400 inline transition-transform duration-200" style={{ transform: `rotate(${headingDeg}deg)` }} />
            <span className="text-slate-500 font-sans">Hd:</span>
            <span className="text-cyan-300 font-semibold">{headingDeg}&deg;</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Speed */}
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-semibold">{speedCmS} cm/s</span>
          </div>

          {/* Slip Warning */}
          {physicsState.slipRatio > 0.05 && (
            <div className="flex items-center gap-1 text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/60 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-bold">SLIP</span>
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
          />
        ) : (
          <Canvas3DRenderer
            physicsState={physicsState}
            mapDef={mapDef}
            boardType={boardType}
            robotSpec={robotSpec}
            sensors={sensors}
            hwState={hwState}
            onRepositionRobot={onRepositionRobot}
          />
        )}
      </div>

      {/* Bottom Floating Controls: Wheel Telemetry (Left) & Robot Rotation Toolbar (Right) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Wheel Encoders Telemetry Bar */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-400 font-sans">Wheels L/R:</span>
          </div>
          <div>
            <span className="text-slate-500">Spd: </span>
            <span className="text-cyan-300">{Math.round(physicsState.leftWheelSpeed)}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-cyan-300">{Math.round(physicsState.rightWheelSpeed)}</span>
            <span className="text-slate-500"> mm/s</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-slate-500">Enc: </span>
            <span className="text-emerald-400">{Math.round(physicsState.leftEncoder)}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-emerald-400">{Math.round(physicsState.rightEncoder)}</span>
            <span className="text-slate-500"> mm</span>
          </div>
        </div>

        {/* Right: Interactive Robot Rotation Control Toolbar */}
        {onRotateRobot && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-lg pointer-events-auto text-xs">
            <div className="flex items-center gap-1 text-cyan-400 font-medium mr-1">
              <Compass className="w-3.5 h-3.5" />
              <span className="text-[11px]">Rotate:</span>
            </div>

            {/* Step Rotate Buttons */}
            <button
              onClick={() => onRotateRobot(-90)}
              title="Turn Left -90°"
              className="px-2 py-0.5 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded-md border border-slate-700/60 font-mono transition text-[11px] flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" /> -90&deg;
            </button>
            <button
              onClick={() => onRotateRobot(-15)}
              title="Turn Left -15°"
              className="px-1.5 py-0.5 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded-md border border-slate-700/60 font-mono transition text-[11px]"
            >
              -15&deg;
            </button>

            <button
              onClick={() => onRotateRobot(15)}
              title="Turn Right +15°"
              className="px-1.5 py-0.5 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded-md border border-slate-700/60 font-mono transition text-[11px]"
            >
              +15&deg;
            </button>
            <button
              onClick={() => onRotateRobot(90)}
              title="Turn Right +90°"
              className="px-2 py-0.5 bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 rounded-md border border-slate-700/60 font-mono transition text-[11px] flex items-center gap-0.5"
            >
              +90&deg; <RotateCw className="w-3 h-3" />
            </button>

            <span className="text-slate-700 mx-0.5">|</span>

            {/* Quick Presets */}
            <button
              onClick={() => onRotateRobot(0, 0)}
              title="Facing East (0°)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                headingDeg === 0
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              0&deg;
            </button>
            <button
              onClick={() => onRotateRobot(0, 90)}
              title="Facing North (90°)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                headingDeg === 90
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              90&deg;
            </button>
            <button
              onClick={() => onRotateRobot(0, 180)}
              title="Facing West (180°)"
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                Math.abs(headingDeg) === 180
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 ml-1"
              title="Adjust Heading Angle (-180° to 180°)"
            />
          </div>
        )}
      </div>
    </div>
  )
}
