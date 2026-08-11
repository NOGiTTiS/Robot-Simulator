import { MapDefinition } from '@/types/project'

export const BUILTIN_MAPS: MapDefinition[] = [
  {
    id: 'athletics-280x160',
    name: 'Athletics Track (280x160cm)',
    imageUrl: '/maps/Athletics-280x160cm.jpg',
    widthMm: 2800,
    heightMm: 1600,
    startX: 300,
    startY: 800,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'robot-120x240',
    name: 'Robot Competition Field (120x240cm)',
    imageUrl: '/maps/Robot120x240cm.jpg',
    widthMm: 2400,
    heightMm: 1200,
    startX: 300,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'wall-line-track',
    name: 'Wall Line Track (200x120cm)',
    imageUrl: '/maps/Wall Line Track.png',
    widthMm: 2000,
    heightMm: 1200,
    startX: 1000,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'qbd-field',
    name: 'QBD Competition Field (240x120cm)',
    imageUrl: '/maps/qbd_field.jpg',
    widthMm: 2400,
    heightMm: 1200,
    startX: 300,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'line-follower-1',
    name: 'Line Follower Track 1 (240x120cm)',
    imageUrl: '/maps/Line Follower 1.png',
    widthMm: 2400,
    heightMm: 1200,
    startX: 300,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'line-follower-2',
    name: 'Line Follower Track 2 (240x120cm)',
    imageUrl: '/maps/Line Follower 2.webp',
    widthMm: 2400,
    heightMm: 1200,
    startX: 300,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'line-follower-3',
    name: 'Line Follower Track 3 (240x120cm)',
    imageUrl: '/maps/Line Follower 3.png',
    widthMm: 2400,
    heightMm: 1200,
    startX: 300,
    startY: 600,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'rt-td-122x244',
    name: 'RT-TD Grid Field (122x244cm)',
    imageUrl: '',
    widthMm: 2440,
    heightMm: 1220,
    startX: 1220,
    startY: 610,
    startHeading: 0,
    isCustom: false
  },
  {
    id: 'line-junior',
    name: 'Programmable Line Junior (200x100cm)',
    imageUrl: '',
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
