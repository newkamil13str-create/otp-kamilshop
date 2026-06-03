import { NextRequest, NextResponse } from 'next/server'
import { authByApiKey } from '@/lib/api-auth'
import { getServices } from '@/lib/rumahotp'

let cache: { data: unknown; ts: number } | null = null
const TTL = 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const auth = await authByApiKey(req)
  if (!auth) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })

  try {
    if (cache && Date.now() - cache.ts < TTL) return NextResponse.json(cache.data)
    const raw = await getServices()
    const services = (raw as any[]).map((s) => ({
      id: String(s.id),
      name: s.name,
      icon: s.icon_url ?? null,
    }))
    cache = { data: services, ts: Date.now() }
    return NextResponse.json(services)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
