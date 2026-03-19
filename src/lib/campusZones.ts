export type ZoneArea = {
  /** normalized 0–1 coordinates */
  x1: number
  y1: number
  x2: number
  y2: number
}

export type ZoneConfig = {
  name: string
  areas: ZoneArea[]
}

export const zones: ZoneConfig[] = [
  {
    name: "Academic Blocks",
    areas: [{ x1: 0.2, y1: 0.15, x2: 0.75, y2: 0.5 }],
  },
  {
    name: "Hostels",
    areas: [{ x1: 0.6, y1: 0.55, x2: 0.95, y2: 0.95 }],
  },
  {
    name: "Parking",
    areas: [{ x1: 0.7, y1: 0.4, x2: 0.95, y2: 0.65 }],
  },
  {
    name: "Sports Complex",
    areas: [{ x1: 0.75, y1: 0.2, x2: 0.98, y2: 0.45 }],
  },
]

export function getZone(x: number, y: number): string | null {
  for (const zone of zones) {
    for (const area of zone.areas) {
      if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
        return zone.name
      }
    }
  }
  return null
}

