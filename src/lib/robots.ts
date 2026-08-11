import { RobotSpec, SensorConfigItem } from '@/types/project'

export const BUILTIN_ROBOT_PRESETS: RobotSpec[] = [
  {
    id: 'atom-vx-std',
    name: 'PT-BOT ATOM-VX Standard',
    boardType: 'ATOM-VX',
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
    description: 'หุ่นยนต์เพื่อการศึกษามาตรฐาน สมดุลดีเยี่ยมสำหรับภารกิจทั่วไปและเดินตามเส้น',
    defaultSensors: [
      { id: 's-atom-0', type: 'IR_LINE', pin: 0, offsetX: 70, offsetY: -40, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-atom-1', type: 'IR_LINE', pin: 1, offsetX: 70, offsetY: -20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-atom-2', type: 'IR_LINE', pin: 2, offsetX: 70, offsetY: 0, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-atom-3', type: 'IR_LINE', pin: 3, offsetX: 70, offsetY: 20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-atom-4', type: 'IR_LINE', pin: 4, offsetX: 70, offsetY: 40, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-atom-tof', type: 'DISTANCE_TOF', pin: 8, offsetX: 80, offsetY: 0, angle: 0, enabled: true },
      { id: 's-atom-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
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
    maxSpeed: 750,
    accelRate: 2400,
    decelRate: 3000,
    frictionCoeff: 0.98,
    color: '#f59e0b',
    presetType: 'sumo',
    isCustom: false,
    description: 'หุ่นยนต์ซูโม่ขนาดใหญ่ แรงบิดและการยึดเกาะสนามสูง เหมาะสำหรับดันวัตถุและงานความเสถียรสูง',
    defaultSensors: [
      { id: 's-pop-0', type: 'IR_LINE', pin: 0, offsetX: 90, offsetY: -60, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop-1', type: 'IR_LINE', pin: 1, offsetX: 90, offsetY: -36, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop-2', type: 'IR_LINE', pin: 2, offsetX: 90, offsetY: -12, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop-3', type: 'IR_LINE', pin: 3, offsetX: 90, offsetY: 12, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop-4', type: 'IR_LINE', pin: 4, offsetX: 90, offsetY: 36, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop-5', type: 'IR_LINE', pin: 5, offsetX: 90, offsetY: 60, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-pop-tof-front', type: 'DISTANCE_TOF', pin: 8, offsetX: 95, offsetY: 0, angle: 0, enabled: true },
      { id: 's-pop-tof-left', type: 'DISTANCE_TOF', pin: 7, offsetX: 85, offsetY: -50, angle: -30, enabled: true },
      { id: 's-pop-tof-right', type: 'DISTANCE_TOF', pin: 6, offsetX: 85, offsetY: 50, angle: 30, enabled: true },
      { id: 's-pop-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  },
  {
    id: 'micromouse-esp32',
    name: 'ESP32 MicroMouse Racer',
    boardType: 'ESP32',
    bodyWidth: 100,
    bodyLength: 120,
    wheelBase: 100,
    wheelRadius: 24,
    maxSpeed: 1100,
    accelRate: 3600,
    decelRate: 4200,
    frictionCoeff: 0.85,
    color: '#10b981',
    presetType: 'speed',
    isCustom: false,
    description: 'หุ่นยนต์จิ๋วความเร็วสูง อัตราเร่งทรงพลัง และการเลี้ยวที่ฉับไว เหมาะกับการแข่งความเร็ว',
    defaultSensors: [
      { id: 's-mm-0', type: 'IR_LINE', pin: 0, offsetX: 50, offsetY: -20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-mm-1', type: 'IR_LINE', pin: 1, offsetX: 50, offsetY: 0, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-mm-2', type: 'IR_LINE', pin: 2, offsetX: 50, offsetY: 20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-mm-tof-fwd', type: 'DISTANCE_TOF', pin: 8, offsetX: 55, offsetY: 0, angle: 0, enabled: true },
      { id: 's-mm-tof-lft', type: 'DISTANCE_TOF', pin: 7, offsetX: 40, offsetY: -35, angle: -45, enabled: true },
      { id: 's-mm-tof-rgt', type: 'DISTANCE_TOF', pin: 6, offsetX: 40, offsetY: 35, angle: 45, enabled: true },
      { id: 's-mm-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
    ]
  },
  {
    id: 'nano-explorer',
    name: 'Arduino Nano Crawler',
    boardType: 'NANO',
    bodyWidth: 130,
    bodyLength: 150,
    wheelBase: 130,
    wheelRadius: 28,
    maxSpeed: 480,
    accelRate: 1400,
    decelRate: 2000,
    frictionCoeff: 0.92,
    color: '#6366f1',
    presetType: 'standard',
    isCustom: false,
    description: 'หุ่นยนต์เรียนรู้ไมโครคอนโทรลเลอร์พื้นฐาน ความเร็วปานกลาง ควบคุมง่ายและคงที่',
    defaultSensors: [
      { id: 's-nano-0', type: 'IR_LINE', pin: 0, offsetX: 65, offsetY: -20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-nano-1', type: 'IR_LINE', pin: 1, offsetX: 65, offsetY: 0, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-nano-2', type: 'IR_LINE', pin: 2, offsetX: 65, offsetY: 20, angle: 0, enabled: true, colorThreshold: 400 },
      { id: 's-nano-tof', type: 'DISTANCE_TOF', pin: 8, offsetX: 70, offsetY: 0, angle: 0, enabled: true },
      { id: 's-nano-imu', type: 'GYRO_IMU', pin: 9, offsetX: 0, offsetY: 0, angle: 0, enabled: true }
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
