export type ObstacleType = 'box' | 'cylinder' | 'wall'

export interface ObstacleItem {
  id: string
  type: ObstacleType
  x: number // Center X in mm
  y: number // Center Y in mm
  width: number // mm
  height: number // mm
  rotation: number // degrees 0-360
  color?: string
}

export const OBSTACLE_PRESETS: { type: ObstacleType; label: string; width: number; height: number; color: string }[] = [
  { type: 'box', label: 'กล่องไม้ (Box 15x15 cm)', width: 150, height: 150, color: '#d97706' },
  { type: 'cylinder', label: 'ทรงกระบอก (Cylinder Ø12 cm)', width: 120, height: 120, color: '#0284c7' },
  { type: 'wall', label: 'กำแพงสิ่งกีดขวาง (Wall 30x5 cm)', width: 300, height: 50, color: '#475569' }
]
