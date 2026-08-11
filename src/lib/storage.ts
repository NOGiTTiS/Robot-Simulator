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
    if (parsed && typeof parsed.boardType === 'string') {
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
