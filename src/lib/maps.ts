import { MapDefinition } from '@/types/project'

export const BUILTIN_MAPS: MapDefinition[] = [
  {
    id: 'athletics-280x160',
    name: 'Athletics (280x160cm)',
    imageUrl: '/maps/athletics.png',
    widthMm: 2800,
    heightMm: 1600,
    startX: 1400,
    startY: 800,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'rt-td-122x244',
    name: 'RT-TD Field (122x244cm)',
    imageUrl: '/maps/rt-td.png',
    widthMm: 2440,
    heightMm: 1220,
    startX: 1220,
    startY: 610,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'robot-120x240',
    name: 'Robot Field (120x240cm)',
    imageUrl: '/maps/robot-120x240.png',
    widthMm: 2400,
    heightMm: 1200,
    startX: 1200,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'wall-line-track',
    name: 'Wall Line Track (200x120cm)',
    imageUrl: '/maps/wall-line.png',
    widthMm: 2000,
    heightMm: 1200,
    startX: 1000,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'qbd-field',
    name: 'QBD Field (240x120cm)',
    imageUrl: '/maps/qbd.png',
    widthMm: 2400,
    heightMm: 1200,
    startX: 1200,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'line-junior',
    name: 'Programmable Line Junior (200x100cm)',
    imageUrl: '/maps/line-junior.png',
    widthMm: 2000,
    heightMm: 1000,
    startX: 1000,
    startY: 500,
    startHeading: 0,
    isCustom: false
  }
]

export function getMapDefinition(mapId: string): MapDefinition {
  const found = BUILTIN_MAPS.find((m) => m.id === mapId)
  if (found) return found
  return BUILTIN_MAPS[0]
}
