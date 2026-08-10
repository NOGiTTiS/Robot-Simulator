export interface SensorConfigItem {
  id: string
  type: 'IR_LINE' | 'DISTANCE_TOF' | 'GYRO_IMU'
  pin: number
  offsetX: number
  offsetY: number
  angle: number
  enabled: boolean
  colorThreshold?: number
}

export interface SensorConfiguration {
  sensors: SensorConfigItem[]
}

export interface CodeTab {
  id: string
  name: string
  code: string
  isMain?: boolean
}

export interface RobotProject {
  id: string
  name: string
  boardType: 'ATOM-VX' | 'POP32i' | 'NANO' | 'ESP32'
  code: string
  files?: CodeTab[]
  activeTabId?: string
  mapId: string
  sensorConfig: SensorConfiguration
  fontSize: number
  updatedAt: number
}

export interface BoardSpec {
  id: string
  name: string
  maxMotors: number
  analogPins: number
  digitalPins: number
  hasKnob: boolean
  hasDisplay: boolean
  supportedApis: string[]
}

export interface MapDefinition {
  id: string
  name: string
  imageUrl: string
  widthMm: number
  heightMm: number
  startX: number
  startY: number
  startHeading: number
  isCustom: boolean
}

export interface RobotPhysicsState {
  x: number
  y: number
  heading: number
  linearVelocity: number
  angularVelocity: number
  leftWheelSpeed: number
  rightWheelSpeed: number
  leftEncoder: number
  rightEncoder: number
  isStuck: boolean
}
