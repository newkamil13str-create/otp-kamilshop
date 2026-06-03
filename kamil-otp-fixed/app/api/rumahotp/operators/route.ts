import { NextRequest, NextResponse } from 'next/server'
import { getOperators } from '@/lib/rumahotp'

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get('country')
  const providerId = req.nextUrl.searchParams.get('provider_id')

  if (!country || !providerId) {
    return NextResponse.json({ error: 'country & provider_id required' }, { status: 400 })
  }

  try {
    const raw = await getOperators(country, providerId)
    return NextResponse.json(raw)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
