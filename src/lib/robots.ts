import { RobotSpec, SensorConfigItem } from '@/types/project'

export const BUILTIN_ROBOT_PRESETS: RobotSpec[] = [
  {
    id: 'pop32-line-2ch',
    name: 'POP32i Line Follower 2 ch',
    boardType: 'POP32i',
    bodyWidth: 140,
    bodyLength: 160,
    wheelBase: 140,
    wheelRadius: 30,
    maxSpeed: 600,
    accelRate: 1800,
    decelRate: 2400,
    frictionCoeff: 0.9,
    color: '#06b6d4',
    presetType: 'standard',
    isCustom: false,
    description: 'หุ่นยนต์เดินตามเส้นแบบ 2 เซนเซอร์ (2-Channel) พร้อมบอร์ด POP32/POP32i ควบคุมง่ายและตอบสนองคงที่',
    defaultSensors: [
      { id: 's-pop2-0', type: 'IR_LINE', pin: 0, offsetX: 70, offsetY: -20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop2-1', type: 'IR_LINE', pin: 1, offsetX: 70, offsetY: 20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop2-tof', type: 'DISTANCE_TOF', pin: 8, offsetX: 80, offsetY: 0, angle: 0, enabled: true },
      { id: 's-pop2-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  },
  {
    id: 'pop32-line-8ch',
    name: 'POP32i Line Follower 8 ch',
    boardType: 'POP32i',
    bodyWidth: 170,
    bodyLength: 180,
    wheelBase: 160,
    wheelRadius: 32,
    maxSpeed: 900,
    accelRate: 2800,
    decelRate: 3400,
    frictionCoeff: 0.92,
    color: '#10b981',
    presetType: 'speed',
    isCustom: false,
    description: 'หุ่นยนต์เดินตามเส้นความเร็วสูง 8 เซนเซอร์ อ่านค่าสีพื้นและเส้นทางได้อย่างแม่นยำและละเอียดสูง',
    defaultSensors: [
      { id: 's-pop8-0', type: 'IR_LINE', pin: 0, offsetX: 80, offsetY: -70, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-1', type: 'IR_LINE', pin: 1, offsetX: 80, offsetY: -50, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-2', type: 'IR_LINE', pin: 2, offsetX: 80, offsetY: -30, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-3', type: 'IR_LINE', pin: 3, offsetX: 80, offsetY: -10, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-4', type: 'IR_LINE', pin: 4, offsetX: 80, offsetY: 10, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-5', type: 'IR_LINE', pin: 5, offsetX: 80, offsetY: 30, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-6', type: 'IR_LINE', pin: 6, offsetX: 80, offsetY: 50, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-7', type: 'IR_LINE', pin: 7, offsetX: 80, offsetY: 70, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop8-tof', type: 'DISTANCE_TOF', pin: 8, offsetX: 88, offsetY: 0, angle: 0, enabled: true },
      { id: 's-pop8-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  },
  {
    id: 'pop32-wall-line-6ch',
    name: 'POP32i Wall Line Track 6 ch',
    boardType: 'POP32i',
    bodyWidth: 160,
    bodyLength: 180,
    wheelBase: 150,
    wheelRadius: 30,
    maxSpeed: 700,
    accelRate: 2200,
    decelRate: 2800,
    frictionCoeff: 0.9,
    color: '#6366f1',
    presetType: 'standard',
    isCustom: false,
    description: 'หุ่นยนต์เดินตามเส้นหน้า-หลัง 6 เซนเซอร์ (Front 4 ch, Rear 2 ch) ออกแบบพิเศษสำหรับสนาม Wall Line Track',
    defaultSensors: [
      { id: 's-wall-0', type: 'IR_LINE', pin: 0, offsetX: 80, offsetY: -45, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-wall-1', type: 'IR_LINE', pin: 1, offsetX: 80, offsetY: -15, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-wall-2', type: 'IR_LINE', pin: 2, offsetX: 80, offsetY: 15, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-wall-3', type: 'IR_LINE', pin: 3, offsetX: 80, offsetY: 45, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-wall-4', type: 'IR_LINE', pin: 4, offsetX: -80, offsetY: -30, angle: 180, enabled: true, colorThreshold: 400 },
      { id: 's-wall-5', type: 'IR_LINE', pin: 5, offsetX: -80, offsetY: 30, angle: 180, enabled: true, colorThreshold: 400 },
      { id: 's-wall-tof', type: 'DISTANCE_TOF', pin: 8, offsetX: 85, offsetY: 0, angle: 0, enabled: true },
      { id: 's-wall-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  },
  {
    id: 'pop32-sumo',
    name: 'POP32i Sumo Defender',
    boardType: 'POP32i',
    bodyWidth: 180,
    bodyLength: 200,
    wheelBase: 170,
    wheelRadius: 35,
    maxSpeed: 800,
    accelRate: 2600,
    decelRate: 3200,
    frictionCoeff: 0.98,
    color: '#f59e0b',
    presetType: 'sumo',
    isCustom: false,
    description: 'หุ่นยนต์ซูโม่ขนาดใหญ่ แรงบิดและการยึดเกาะสนามสูง พร้อมเซนเซอร์ขอบสนาม 4 จุดและ TOF 3 ทิศทาง',
    defaultSensors: [
      { id: 's-sumo-0', type: 'IR_LINE', pin: 0, offsetX: 90, offsetY: -60, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-sumo-1', type: 'IR_LINE', pin: 1, offsetX: 90, offsetY: 60, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-sumo-2', type: 'IR_LINE', pin: 2, offsetX: -90, offsetY: -60, angle: 180, enabled: true, colorThreshold: 400 },
      { id: 's-sumo-3', type: 'IR_LINE', pin: 3, offsetX: -90, offsetY: 60, angle: 180, enabled: true, colorThreshold: 400 },
      { id: 's-sumo-tof-fwd', type: 'DISTANCE_TOF', pin: 8, offsetX: 95, offsetY: 0, angle: 0, enabled: true },
      { id: 's-sumo-tof-lft', type: 'DISTANCE_TOF', pin: 7, offsetX: 85, offsetY: -50, angle: -30, enabled: true },
      { id: 's-sumo-tof-rgt', type: 'DISTANCE_TOF', pin: 6, offsetX: 85, offsetY: 50, angle: 30, enabled: true },
      { id: 's-sumo-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  },
  {
    id: 'pop32-move-can',
    name: 'POP32i Move The Can',
    boardType: 'POP32i',
    bodyWidth: 160,
    bodyLength: 180,
    wheelBase: 150,
    wheelRadius: 32,
    maxSpeed: 750,
    accelRate: 2200,
    decelRate: 2800,
    frictionCoeff: 0.94,
    color: '#a855f7',
    presetType: 'standard',
    isCustom: false,
    description: 'หุ่นยนต์ภารกิจค้นหาและย้ายกระป๋อง (Move The Can) พร้อมเซนเซอร์ระยะทาง TOF สแกนกระป๋องและเซนเซอร์อ่านเส้นทาง',
    defaultSensors: [
      { id: 's-can-0', type: 'IR_LINE', pin: 0, offsetX: 80, offsetY: -45, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-can-1', type: 'IR_LINE', pin: 1, offsetX: 80, offsetY: -15, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-can-2', type: 'IR_LINE', pin: 2, offsetX: 80, offsetY: 15, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-can-3', type: 'IR_LINE', pin: 3, offsetX: 80, offsetY: 45, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-can-tof-fwd', type: 'DISTANCE_TOF', pin: 8, offsetX: 88, offsetY: 0, angle: 0, enabled: true },
      { id: 's-can-tof-lft', type: 'DISTANCE_TOF', pin: 7, offsetX: 80, offsetY: -40, angle: -20, enabled: true },
      { id: 's-can-tof-rgt', type: 'DISTANCE_TOF', pin: 6, offsetX: 80, offsetY: 40, angle: 20, enabled: true },
      { id: 's-can-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  }
]

export const DEFAULT_ROBOT_SPEC: RobotSpec = BUILTIN_ROBOT_PRESETS[0]

export function getRobotSpec(id: string, customRobots: RobotSpec[] = []): RobotSpec {
  const foundCustom = customRobots.find((r) => r.id === id)
  if (foundCustom) return foundCustom

  const foundBuiltin = BUILTIN_ROBOT_PRESETS.find((r) => r.id === id)
  if (foundBuiltin) return foundBuiltin

  return DEFAULT_ROBOT_SPEC
}

export function getDefaultSensorsForRobot(robot: RobotSpec): SensorConfigItem[] {
  if (robot.defaultSensors && robot.defaultSensors.length > 0) {
    return robot.defaultSensors.map((s) => ({ ...s }))
  }

  const builtin = BUILTIN_ROBOT_PRESETS.find((r) => r.id === robot.id)
  if (builtin && builtin.defaultSensors) {
    return builtin.defaultSensors.map((s) => ({ ...s }))
  }

  // Fallback procedural calculation based on chassis size
  const noseX = Math.round(robot.bodyLength / 2 - 10)
  const widthHalf = Math.round(robot.bodyWidth / 2 - 20)

  return [
    { id: `s-dyn-0`, type: 'IR_LINE', pin: 0, offsetX: noseX, offsetY: -widthHalf, angle: 0, enabled: true, colorThreshold: 400 },
    { id: `s-dyn-1`, type: 'IR_LINE', pin: 1, offsetX: noseX, offsetY: -Math.round(widthHalf / 2), angle: 0, enabled: true, colorThreshold: 400 },
    { id: `s-dyn-2`, type: 'IR_LINE', pin: 2, offsetX: noseX, offsetY: 0, angle: 0, enabled: true, colorThreshold: 400 },
    { id: `s-dyn-3`, type: 'IR_LINE', pin: 3, offsetX: noseX, offsetY: Math.round(widthHalf / 2), angle: 0, enabled: true, colorThreshold: 400 },
    { id: `s-dyn-4`, type: 'IR_LINE', pin: 4, offsetX: noseX, offsetY: widthHalf, angle: 0, enabled: true, colorThreshold: 400 },
    { id: `s-dyn-tof`, type: 'DISTANCE_TOF', pin: 8, offsetX: noseX + 10, offsetY: 0, angle: 0, enabled: true },
    { id: `s-dyn-imu`, type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
  ]
}

export function syncSensorsWithRobotDimensions(
  sensors: SensorConfigItem[],
  robot: RobotSpec
): SensorConfigItem[] {
  const noseX = Math.round(robot.bodyLength / 2 - 10)
  const maxOffsetY = Math.round(robot.bodyWidth / 2 - 15)

  return sensors.map((s) => {
    // If sensor was near the front nose, adjust offsetX to match new nose length
    if (s.type === 'IR_LINE') {
      if (s.offsetX < 0) {
        return {
          ...s,
          offsetX: -noseX,
          offsetY: Math.max(-maxOffsetY, Math.min(maxOffsetY, s.offsetY))
        }
      }
      return {
        ...s,
        offsetX: noseX,
        offsetY: Math.max(-maxOffsetY, Math.min(maxOffsetY, s.offsetY))
      }
    } else if (s.type === 'DISTANCE_TOF' && s.angle === 0) {
      return {
        ...s,
        offsetX: noseX + 10
      }
    }
    return s
  })
}
