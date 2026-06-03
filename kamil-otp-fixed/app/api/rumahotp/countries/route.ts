import { NextRequest, NextResponse } from 'next/server'
import { getCountries, applyMarkup } from '@/lib/rumahotp'

const FLAG_MAP: Record<string, string> = {
  indonesia: '🇮🇩', russia: '🇷🇺', ukraine: '🇺🇦', india: '🇮🇳',
  usa: '🇺🇸', 'united states': '🇺🇸', 'united kingdom': '🇬🇧', germany: '🇩🇪',
  france: '🇫🇷', china: '🇨🇳', japan: '🇯🇵', 'south korea': '🇰🇷',
  brazil: '🇧🇷', vietnam: '🇻🇳', thailand: '🇹🇭', malaysia: '🇲🇾',
  philippines: '🇵🇭', singapore: '🇸🇬', myanmar: '🇲🇲', cambodia: '🇰🇭',
  laos: '🇱🇦', pakistan: '🇵🇰', bangladesh: '🇧🇩', nigeria: '🇳🇬',
  ghana: '🇬🇭', egypt: '🇪🇬', turkey: '🇹🇷', poland: '🇵🇱',
  spain: '🇪🇸', italy: '🇮🇹', netherlands: '🇳🇱', sweden: '🇸🇪',
  norway: '🇳🇴', denmark: '🇩🇰', finland: '🇫🇮', portugal: '🇵🇹',
  'czech republic': '🇨🇿', romania: '🇷🇴', hungary: '🇭🇺', austria: '🇦🇹',
  switzerland: '🇨🇭', belgium: '🇧🇪', mexico: '🇲🇽', argentina: '🇦🇷',
  colombia: '🇨🇴', chile: '🇨🇱', peru: '🇵🇪', canada: '🇨🇦',
  australia: '🇦🇺', 'new zealand': '🇳🇿', 'south africa': '🇿🇦',
  kenya: '🇰🇪', ethiopia: '🇪🇹', tanzania: '🇹🇿', uganda: '🇺🇬',
}

let cache: { data: unknown; ts: number } | null = null
const TTL = 60 * 60 * 1000 // 1 jam

export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get('service_id') ?? undefined

  try {
    if (!serviceId && cache && Date.now() - cache.ts < TTL) {
      return NextResponse.json(cache.data)
    }

    const raw = await getCountries(serviceId)

    // raw adalah object: { [countryName]: { pricelist: [...] } }
    const countries = Object.entries(raw as Record<string, any>).map(([name, info]) => {
      const key = name.toLowerCase()
      const pricelist = info?.pricelist ?? []
      // Ambil harga minimum dari pricelist
      const minPrice = pricelist.length > 0
        ? Math.min(...pricelist.map((p: any) => applyMarkup(parseFloat(p.price ?? '0'))))
        : 0

      return {
        iso: key.replace(/\s+/g, '_'),
        name,
        flag: FLAG_MAP[key] ?? '🌐',
        prefix: info?.prefix ?? '',
        minPrice,
        pricelist,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))

    if (!serviceId) cache = { data: countries, ts: Date.now() }
    return NextResponse.json(countries)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
