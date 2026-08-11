'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Zap, Sparkles } from 'lucide-react'
import { HeaderBar } from '@/components/layout/HeaderBar'
import { ResizableSplit } from '@/components/layout/ResizableSplit'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { SimulatorContainer } from '@/components/simulator/SimulatorContainer'
import { DrawerConsole } from '@/components/layout/DrawerConsole'
import { SensorConfigModal } from '@/components/layout/SensorConfigModal'
import { CustomMapModal } from '@/components/layout/CustomMapModal'
import { MapSelectModal } from '@/components/layout/MapSelectModal'
import { MapDrawerModal } from '@/components/layout/MapDrawerModal'
import { MapEditModal } from '@/components/layout/MapEditModal'
import {
  InterpreterRunner,
  bindBoardApis,
  createInitialHardwareState,
  resetHardwareState,
  HardwareState
} from '@/lib/interpreter'
import {
  stepPhysics,
  createInitialPhysicsState,
  ExtendedPhysicsState,
  DEFAULT_PHYSICS_CONFIG
} from '@/lib/physics/kinematics'
import { getMapDefinition } from '@/lib/maps'
import { MapDefinition, SensorConfigItem, SensorConfiguration, CodeTab } from '@/types/project'
import { loadProjectState, saveProjectState } from '@/lib/storage'

const DEFAULT_CODE = `#include <ATOM_VX.h>

void setup() {
  // Initialize robot configuration
  Serial.begin(9600);
  Serial.println("TUNorth Robot Initialized!");
}

void loop() {
  // Line following demo & distance detection
  int lineCenter = analog(2);
  int dist = analog(8);

  if (dist > 0 && dist < 15) {
    // Obstacle detected close by
    ao();
    Serial.println("Obstacle Warning!");
    delay(500);
    tr(60);
    delay(400);
  } else if (lineCenter < 400) {
    // Sensed line at center sensor
    fd(70);
  } else {
    // Searching line
    fd(50);
  }
}
`

const DEFAULT_FILES: CodeTab[] = [
  {
    id: 'tab-main',
    name: 'main.ino',
    code: DEFAULT_CODE,
    isMain: true
  }
]

const DEFAULT_SENSORS: SensorConfigItem[] = [
  { id: 's0', type: 'IR_LINE', pin: 0, offsetX: 70, offsetY: -40, angle: 0, enabled: true, colorThreshold: 400 },
  { id: 's1', type: 'IR_LINE', pin: 1, offsetX: 70, offsetY: -20, angle: 0, enabled: true, colorThreshold: 400 },
  { id: 's2', type: 'IR_LINE', pin: 2, offsetX: 70, offsetY: 0, angle: 0, enabled: true, colorThreshold: 400 },
  { id: 's3', type: 'IR_LINE', pin: 3, offsetX: 70, offsetY: 20, angle: 0, enabled: true, colorThreshold: 400 },
  { id: 's4', type: 'IR_LINE', pin: 4, offsetX: 70, offsetY: 40, angle: 0, enabled: true, colorThreshold: 400 },
  { id: 's5', type: 'DISTANCE_TOF', pin: 8, offsetX: 80, offsetY: 0, angle: 0, enabled: true },
  { id: 's6', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
]

export default function Home() {
  const [boardType, setBoardType] = useState<string>('ATOM-VX')
  const [mapId, setMapId] = useState<string>('athletics-280x160')
  const [customMaps, setCustomMaps] = useState<MapDefinition[]>([])
  const [sensorConfig, setSensorConfig] = useState<SensorConfiguration>({ sensors: DEFAULT_SENSORS })

  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false)
  const [isMapSelectModalOpen, setIsMapSelectModalOpen] = useState(false)
  const [isMapDrawerModalOpen, setIsMapDrawerModalOpen] = useState(false)
  const [isMapEditModalOpen, setIsMapEditModalOpen] = useState(false)
  const [isCustomMapModalOpen, setIsCustomMapModalOpen] = useState(false)
  const [editingMap, setEditingMap] = useState<MapDefinition | null>(null)

  const [files, setFiles] = useState<CodeTab[]>(DEFAULT_FILES)
  const [activeTabId, setActiveTabId] = useState<string>('tab-main')

  const [fontSize, setFontSize] = useState<number>(14)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const [logs, setLogs] = useState<string[]>([
    'TUNorth Robot Simulator System v1.0 Ready',
    'Board ATOM-VX selected.'
  ])

  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // 1. Auto Load Saved State on Mount
  useEffect(() => {
    const saved = loadProjectState()
    if (saved) {
      if (saved.boardType) setBoardType(saved.boardType)
      if (saved.mapId) setMapId(saved.mapId)
      if (saved.files && Array.isArray(saved.files) && saved.files.length > 0) {
        setFiles(saved.files)
        if (saved.activeTabId && saved.files.some((f) => f.id === saved.activeTabId)) {
          setActiveTabId(saved.activeTabId)
        } else {
          setActiveTabId(saved.files[0].id)
        }
      } else if (saved.code) {
        setFiles([
          {
            id: 'tab-main',
            name: 'main.ino',
            code: saved.code,
            isMain: true
          }
        ])
        setActiveTabId('tab-main')
      }
      if (saved.sensorConfig) setSensorConfig(saved.sensorConfig)
      if (saved.fontSize) setFontSize(saved.fontSize)
      if (saved.speedMultiplier) setSpeedMultiplier(saved.speedMultiplier)
      if (saved.viewMode) setViewMode(saved.viewMode)
      if (saved.customMaps && Array.isArray(saved.customMaps)) setCustomMaps(saved.customMaps)
      setLogs((prev) => [...prev, 'Loaded saved project state from LocalStorage 💾'])
    }
    setIsLoaded(true)
  }, [])

  // Combine code from all tabs for evaluation (Arduino IDE Style)
  const getCombinedCode = useCallback((tabsList: CodeTab[]) => {
    const mainTab = tabsList.find((t) => t.isMain || t.name === 'main.ino') || tabsList[0]
    const otherTabs = tabsList.filter((t) => t.id !== mainTab?.id)

    let combined = mainTab ? mainTab.code : ''
    for (const tab of otherTabs) {
      combined += `\n\n// --- File: ${tab.name} ---\n` + tab.code
    }
    return combined
  }, [])

  // 2. Auto Save Project State on Changes (Debounced)
  useEffect(() => {
    if (!isLoaded) return
    const timer = setTimeout(() => {
      const activeTab = files.find((f) => f.id === activeTabId) || files[0]
      saveProjectState({
        code: activeTab ? activeTab.code : '',
        files,
        activeTabId,
        boardType,
        mapId,
        sensorConfig,
        fontSize,
        speedMultiplier,
        viewMode,
        customMaps
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [files, activeTabId, boardType, mapId, sensorConfig, fontSize, speedMultiplier, viewMode, customMaps, isLoaded])

  // Get active map definition (built-in or custom uploaded)
  const mapDef = customMaps.find((m) => m.id === mapId) || getMapDefinition(mapId)

  const [physicsState, setPhysicsState] = useState<ExtendedPhysicsState>(() =>
    createInitialPhysicsState(mapDef.startX, mapDef.startY, mapDef.startHeading)
  )

  // Align physics state with active map when loaded or changed
  useEffect(() => {
    if (!isLoaded) return
    const currentMap = customMaps.find((m) => m.id === mapId) || getMapDefinition(mapId)
    const initialPhysics = createInitialPhysicsState(currentMap.startX, currentMap.startY, currentMap.startHeading)
    setPhysicsState(initialPhysics)
    physicsRef.current = initialPhysics
  }, [mapId, customMaps, isLoaded])
  const [trailPath, setTrailPath] = useState<{ x: number; y: number }[]>([])

  const physicsRef = useRef<ExtendedPhysicsState>(physicsState)
  const hwStateRef = useRef<HardwareState>(createInitialHardwareState())
  const runnerRef = useRef<InterpreterRunner | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    physicsRef.current = physicsState
  }, [physicsState])

  // Initialize runner instance & bind API
  useEffect(() => {
    resetHardwareState(hwStateRef.current)

    const runner = new InterpreterRunner({
      onLog: (msg) => {
        setLogs((prev) => [...prev, msg.trimEnd()])
      },
      onStateChange: (state) => {
        if (state === 'RUNNING') setIsRunning(true)
        else if (state === 'PAUSED' || state === 'IDLE' || state === 'ERROR') setIsRunning(false)
      },
      onError: (err) => {
        setLogs((prev) => [...prev, `[Execution Error] ${err}`])
      }
    })

    bindBoardApis(
      boardType,
      (name, fn) => runner.registerHardwareApi(name, fn),
      hwStateRef.current
    )

    runnerRef.current = runner

    return () => {
      runner.stop()
    }
  }, [boardType])

  useEffect(() => {
    if (runnerRef.current) {
      runnerRef.current.setSpeedMultiplier(speedMultiplier)
    }
  }, [speedMultiplier])

  // Physics Simulation RAF Loop
  const runPhysicsLoop = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const rawDt = (time - lastTimeRef.current) / 1000
      const dt = Math.min(0.05, Math.max(0.001, rawDt)) * speedMultiplier

      const activeMap = customMaps.find((m) => m.id === mapId) || getMapDefinition(mapId)
      const motorLeft = hwStateRef.current.leftMotorSpeed
      const motorRight = hwStateRef.current.rightMotorSpeed

      const nextPhysics = stepPhysics(
        physicsRef.current,
        motorLeft,
        motorRight,
        dt,
        { widthMm: activeMap.widthMm, heightMm: activeMap.heightMm },
        DEFAULT_PHYSICS_CONFIG
      )

      physicsRef.current = nextPhysics
      setPhysicsState(nextPhysics)

      if (nextPhysics.linearVelocity !== 0 || nextPhysics.angularVelocity !== 0) {
        setTrailPath((prev) => {
          const lastPt = prev[prev.length - 1]
          if (!lastPt || Math.hypot(lastPt.x - nextPhysics.x, lastPt.y - nextPhysics.y) > 10) {
            const nextTrail = [...prev, { x: nextPhysics.x, y: nextPhysics.y }]
            return nextTrail.slice(-400)
          }
          return prev
        })
      }
    }
    lastTimeRef.current = time
    animFrameRef.current = requestAnimationFrame(runPhysicsLoop)
  }, [mapId, speedMultiplier, customMaps])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(runPhysicsLoop)
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [runPhysicsLoop])

  const handleRepositionRobot = useCallback((x: number, y: number) => {
    const updatedState = {
      ...physicsRef.current,
      x,
      y,
      linearVelocity: 0,
      angularVelocity: 0,
      leftWheelSpeed: 0,
      rightWheelSpeed: 0
    }
    physicsRef.current = updatedState
    setPhysicsState(updatedState)
  }, [])

  const handleRotateRobot = useCallback((deltaDeg: number, absoluteDeg?: number) => {
    setPhysicsState((prev) => {
      let currentDeg = Math.round((prev.heading * 180) / Math.PI)
      let nextDeg = absoluteDeg !== undefined ? absoluteDeg : currentDeg + deltaDeg

      while (nextDeg > 180) nextDeg -= 360
      while (nextDeg < -180) nextDeg += 360

      const nextHeadingRad = (nextDeg * Math.PI) / 180
      const updated = {
        ...prev,
        heading: nextHeadingRad,
        angularVelocity: 0
      }
      physicsRef.current = updated
      return updated
    })
  }, [])

  // Add custom map
  const handleAddCustomMap = (newMap: MapDefinition) => {
    setCustomMaps((prev) => [...prev, newMap])
    setMapId(newMap.id)
    resetHardwareState(hwStateRef.current)
    const resetPhysics = createInitialPhysicsState(newMap.startX, newMap.startY, newMap.startHeading)
    setPhysicsState(resetPhysics)
    physicsRef.current = resetPhysics
    setTrailPath([])
    setLogs((prev) => [...prev, `Loaded Custom Map: ${newMap.name}`])
  }

  // Delete custom map
  const handleDeleteCustomMap = (targetMapId: string) => {
    const targetMap = customMaps.find((m) => m.id === targetMapId)
    setCustomMaps((prev) => prev.filter((m) => m.id !== targetMapId))

    // Fallback to default builtin map if active map was deleted
    if (mapId === targetMapId) {
      const defaultMapId = 'athletics-280x160'
      setMapId(defaultMapId)
      const defaultDef = getMapDefinition(defaultMapId)
      const resetPhysics = createInitialPhysicsState(defaultDef.startX, defaultDef.startY, defaultDef.startHeading)
      setPhysicsState(resetPhysics)
      physicsRef.current = resetPhysics
      setTrailPath([])
    }

    setLogs((prev) => [...prev, `Deleted Custom Map: ${targetMap?.name || targetMapId}`])
  }

  // Edit & Update custom map
  const handleOpenEditMap = (map: MapDefinition) => {
    setEditingMap(map)
    setIsMapEditModalOpen(true)
  }

  const handleUpdateCustomMap = (updatedMap: MapDefinition) => {
    setCustomMaps((prev) => prev.map((m) => (m.id === updatedMap.id ? updatedMap : m)))

    if (mapId === updatedMap.id) {
      const resetPhysics = createInitialPhysicsState(updatedMap.startX, updatedMap.startY, updatedMap.startHeading)
      setPhysicsState(resetPhysics)
      physicsRef.current = resetPhysics
    }

    setLogs((prev) => [...prev, `Updated Map Dimensions: ${updatedMap.name}`])
  }

  const handleFontSizeChange = (sizeOrFn: number | ((prev: number) => number)) => {
    setFontSize((prev) => {
      const nextSize = typeof sizeOrFn === 'function' ? sizeOrFn(prev) : sizeOrFn
      const clamped = Math.min(32, Math.max(10, nextSize))
      return clamped
    })
  }

  // Multi-Tab Code Handlers
  const handleCodeChange = (tabId: string, newCode: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === tabId ? { ...f, code: newCode } : f))
    )
  }

  const handleAddTab = (fileName: string) => {
    const newId = `tab-${Date.now()}`
    const newTab: CodeTab = {
      id: newId,
      name: fileName,
      code: `// ${fileName}\n\n`,
      isMain: false
    }
    setFiles((prev) => [...prev, newTab])
    setActiveTabId(newId)
    setLogs((prev) => [...prev, `Created new sketch tab: ${fileName}`])
  }

  const handleDeleteTab = (tabId: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== tabId)
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[0].id)
      }
      return filtered
    })
    setLogs((prev) => [...prev, `Closed tab`])
  }

  const handleRenameTab = (tabId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === tabId ? { ...f, name: newName } : f))
    )
    setLogs((prev) => [...prev, `Renamed tab to ${newName}`])
  }

  const handleBoardChange = (board: string) => {
    setBoardType(board)
    setLogs((prev) => [...prev, `Board changed to ${board}`])
  }

  const handleMapChange = (map: string) => {
    setMapId(map)
    resetHardwareState(hwStateRef.current)
    const newMapDef = customMaps.find((m) => m.id === map) || getMapDefinition(map)
    const resetPhysics = createInitialPhysicsState(newMapDef.startX, newMapDef.startY, newMapDef.startHeading)
    setPhysicsState(resetPhysics)
    physicsRef.current = resetPhysics
    setTrailPath([])
    setLogs((prev) => [...prev, `Map changed to ${newMapDef.name}`])
  }

  const handleToggleRun = () => {
    if (!runnerRef.current) return

    if (isRunning) {
      runnerRef.current.pause()
      setIsRunning(false)
      setLogs((prev) => [...prev, 'Simulation paused ⏸'])
    } else {
      if (runnerRef.current.getState() === 'PAUSED') {
        runnerRef.current.resume()
        setIsRunning(true)
        setLogs((prev) => [...prev, 'Simulation resumed ▶'])
      } else {
        resetHardwareState(hwStateRef.current)
        setLogs((prev) => [...prev, 'Starting simulation ▶'])
        const combinedCode = getCombinedCode(files)
        runnerRef.current.start(combinedCode)
      }
    }
  }

  const handleReset = () => {
    if (runnerRef.current) {
      runnerRef.current.stop()
    }
    resetHardwareState(hwStateRef.current)
    const currentMapDef = customMaps.find((m) => m.id === mapId) || getMapDefinition(mapId)
    const resetPhysics = createInitialPhysicsState(currentMapDef.startX, currentMapDef.startY, currentMapDef.startHeading)
    setPhysicsState(resetPhysics)
    physicsRef.current = resetPhysics
    setTrailPath([])
    setIsRunning(false)
    setLogs((prev) => [...prev, 'Simulation reset 🔄'])
  }

  const handleExport = (format: 'ino' | 'cpp' = 'ino') => {
    const ext = format === 'cpp' ? 'cpp' : 'ino'
    const activeTab = files.find((f) => f.id === activeTabId) || files[0]
    const exportContent = files.length > 1 ? getCombinedCode(files) : (activeTab ? activeTab.code : '')

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab ? activeTab.name.split('.')[0] : 'sketch'}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setLogs((prev) => [...prev, `Code exported to ${a.download} file 📥`])
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ino,.cpp,.c,.h,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          if (content) {
            // Import into active tab or create new tab
            const fileName = file.name
            const existingTab = files.find((f) => f.name.toLowerCase() === fileName.toLowerCase())
            if (existingTab) {
              handleCodeChange(existingTab.id, content)
              setActiveTabId(existingTab.id)
            } else {
              const newId = `tab-${Date.now()}`
              setFiles((prev) => [
                ...prev,
                { id: newId, name: fileName, code: content, isMain: false }
              ])
              setActiveTabId(newId)
            }

            // Auto detect board header
            if (content.includes('<ATOM_VX.h>')) {
              setBoardType('ATOM-VX')
            } else if (content.includes('<POP32.h>') || content.includes('<pop32.h>')) {
              setBoardType('POP32i')
            } else if (content.includes('<Arduino.h>')) {
              setBoardType('NANO')
            }
            setLogs((prev) => [...prev, `Imported ${file.name} successfully 📂`])
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans select-none">
        <div className="flex flex-col items-center gap-4 bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              TUNorth Robot Simulator
            </h1>
            <p className="text-xs text-slate-400 mt-1">โรงเรียนเตรียมอุดมศึกษาภาคเหนือ</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mt-2 font-mono">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>กำลังเตรียมระบบและส่วนควบคุม...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header Bar */}
      <HeaderBar
        boardType={boardType}
        onBoardChange={handleBoardChange}
        mapId={mapId}
        onMapChange={handleMapChange}
        customMaps={customMaps}
        onOpenMapSelectModal={() => setIsMapSelectModalOpen(true)}
        onOpenCustomMapModal={() => setIsCustomMapModalOpen(true)}
        onOpenSensorModal={() => setIsSensorModalOpen(true)}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* 2. Main Resizable Panels */}
      <div className="flex-1 w-full overflow-hidden relative">
        <ResizableSplit
          leftComponent={
            <CodeEditor
              files={files}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onAddTab={handleAddTab}
              onDeleteTab={handleDeleteTab}
              onRenameTab={handleRenameTab}
              onChangeCode={handleCodeChange}
              fontSize={fontSize}
              onFontSizeChange={handleFontSizeChange}
              boardType={boardType}
            />
          }
          rightComponent={
            <SimulatorContainer
              viewMode={viewMode}
              mapDef={mapDef}
              boardType={boardType}
              isRunning={isRunning}
              physicsState={physicsState}
              trailPath={trailPath}
              sensors={sensorConfig.sensors}
              hwState={hwStateRef.current}
              onOpenSensorConfig={() => setIsSensorModalOpen(true)}
              onOpenMapModal={() => setIsMapSelectModalOpen(true)}
              onRepositionRobot={handleRepositionRobot}
              onRotateRobot={handleRotateRobot}
            />
          }
        />
      </div>

      {/* 3. Bottom Drawer Console */}
      <DrawerConsole
        logs={logs}
        onClearLogs={() => setLogs([])}
        sensors={sensorConfig.sensors}
        hwState={hwStateRef.current}
        physicsState={physicsState}
      />

      {/* 4. Modals */}
      <MapSelectModal
        isOpen={isMapSelectModalOpen}
        onClose={() => setIsMapSelectModalOpen(false)}
        mapId={mapId}
        onMapChange={handleMapChange}
        customMaps={customMaps}
        onOpenCustomMapModal={() => setIsCustomMapModalOpen(true)}
        onOpenMapDrawerModal={() => setIsMapDrawerModalOpen(true)}
        onEditCustomMap={handleOpenEditMap}
        onDeleteCustomMap={handleDeleteCustomMap}
      />

      <MapDrawerModal
        isOpen={isMapDrawerModalOpen}
        onClose={() => setIsMapDrawerModalOpen(false)}
        onAddMap={handleAddCustomMap}
      />

      <MapEditModal
        isOpen={isMapEditModalOpen}
        onClose={() => setIsMapEditModalOpen(false)}
        mapDef={editingMap}
        onUpdateMap={handleUpdateCustomMap}
      />

      <SensorConfigModal
        isOpen={isSensorModalOpen}
        onClose={() => setIsSensorModalOpen(false)}
        sensorConfig={sensorConfig}
        onChangeSensorConfig={setSensorConfig}
      />

      <CustomMapModal
        isOpen={isCustomMapModalOpen}
        onClose={() => setIsCustomMapModalOpen(false)}
        onAddMap={handleAddCustomMap}
      />
    </div>
  )
}
