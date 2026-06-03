import { NextRequest, NextResponse } from 'next/server'
import { authByApiKey } from '@/lib/api-auth'
import { getCountries, applyMarkup } from '@/lib/rumahotp'

export async function GET(req: NextRequest) {
  const auth = await authByApiKey(req)
  if (!auth) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })

  const serviceId = req.nextUrl.searchParams.get('service_id') ?? undefined
  try {
    const raw = await getCountries(serviceId)
    const countries = Object.entries(raw as Record<string, any>).map(([name, info]) => {
      const pricelist = info?.pricelist ?? []
      const minPrice = pricelist.length > 0
        ? Math.min(...pricelist.map((p: any) => applyMarkup(parseFloat(p.price ?? '0'))))
        : 0
      return { name, prefix: info?.prefix ?? '', minPrice, pricelist }
    }).sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json(countries)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
