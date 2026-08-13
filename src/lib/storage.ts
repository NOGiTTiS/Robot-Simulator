import { MapDefinition, SensorConfiguration, CodeTab, RobotSpec } from '@/types/project'

export interface StoredProjectState {
  code: string
  files?: CodeTab[]
  activeTabId?: string
  boardType: string
  mapId: string
  sensorConfig: SensorConfiguration
  robotSpec?: RobotSpec
  customRobots?: RobotSpec[]
  fontSize: number
  speedMultiplier: number
  viewMode: '2D' | '3D'
  showSensorsOverlay?: boolean
  showTrail?: boolean
  customMaps: MapDefinition[]
  theme?: 'dark' | 'light'
  lastSavedAt: number
}

const STORAGE_KEY = 'tunorth_robot_simulator_project_v1'

export function saveProjectState(state: Omit<StoredProjectState, 'lastSavedAt'>): boolean {
  if (typeof window === 'undefined') return false
  try {
    const payload: StoredProjectState = {
      ...state,
      lastSavedAt: Date.now()
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch (err) {
    console.error('Failed to auto-save project state to localStorage:', err)
    return false
  }
}

export function loadProjectState(): StoredProjectState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredProjectState
    if (parsed && typeof parsed === 'object') {
      if (!parsed.boardType || typeof parsed.boardType !== 'string') {
        parsed.boardType = 'POP32i'
      }
      if (!parsed.files || !Array.isArray(parsed.files) || parsed.files.length === 0) {
        parsed.files = [
          {
            id: 'tab-main',
            name: 'main.ino',
            code: parsed.code || '',
            isMain: true
          }
        ]
        parsed.activeTabId = 'tab-main'
      }
      if (!parsed.activeTabId || !parsed.files.some((f) => f.id === parsed.activeTabId)) {
        parsed.activeTabId = parsed.files[0]?.id || 'tab-main'
      }
      if (!parsed.sensorConfig || typeof parsed.sensorConfig !== 'object' || !Array.isArray(parsed.sensorConfig.sensors)) {
        parsed.sensorConfig = { sensors: [] }
      }
      if (!parsed.customMaps || !Array.isArray(parsed.customMaps)) {
        parsed.customMaps = []
      }
      if (!parsed.customRobots || !Array.isArray(parsed.customRobots)) {
        parsed.customRobots = []
      }
      return parsed
    }
    return null
  } catch (err) {
    console.error('Failed to load project state from localStorage:', err)
    return null
  }
}

export function clearProjectState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear project state:', err)
  }
}
