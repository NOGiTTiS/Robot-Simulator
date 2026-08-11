import { RobotSpec } from '@/types/project'

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
    description: 'หุ่นยนต์เพื่อการศึกษามาตรฐาน สมดุลดีเยี่ยมสำหรับภารกิจทั่วไปและเดินตามเส้น'
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
    description: 'หุ่นยนต์ซูโม่ขนาดใหญ่ แรงบิดและการยึดเกาะสนามสูง เหมาะสำหรับดันวัตถุและงานความเสถียรสูง'
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
    description: 'หุ่นยนต์จิ๋วความเร็วสูง อัตราเร่งทรงพลัง และการเลี้ยวที่ฉับไว เหมาะกับการแข่งความเร็ว'
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
    description: 'หุ่นยนต์เรียนรู้ไมโครคอนโทรลเลอร์พื้นฐาน ความเร็วปานกลาง ควบคุมง่ายและคงที่'
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
