import { NextRequest, NextResponse } from 'next/server'
import { getTopup } from '@/lib/firestore'
import { verifyFirebaseToken } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let uid: string
  try {
    const decoded = await verifyFirebaseToken(token)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Token invalid' }, { status: 401 })
  }

  const topupId = req.nextUrl.searchParams.get('topupId')
  if (!topupId) return NextResponse.json({ error: 'topupId required' }, { status: 400 })

  try {
    const topup = await getTopup(topupId)
    if (!topup) return NextResponse.json({ error: 'Topup tidak ditemukan' }, { status: 404 })
    if (topup.uid !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ status: topup.status, amount: topup.amount, paidAt: topup.paidAt })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
