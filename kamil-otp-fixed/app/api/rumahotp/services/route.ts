import { NextRequest, NextResponse } from 'next/server'
import { getServices } from '@/lib/rumahotp'

let cache: { data: unknown; ts: number } | null = null
const TTL = 60 * 60 * 1000

export async function GET(_req: NextRequest) {
  try {
    if (cache && Date.now() - cache.ts < TTL) {
      return NextResponse.json(cache.data)
    }

    const raw = await getServices()

    // raw: array of { id, name, icon_url, ... }
    const services = (raw as any[]).map((s) => ({
      id: String(s.id),
      name: s.name,
      displayName: s.name,
      icon: s.icon_url ?? null,
    }))

    cache = { data: services, ts: Date.now() }
    return NextResponse.json(services)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
