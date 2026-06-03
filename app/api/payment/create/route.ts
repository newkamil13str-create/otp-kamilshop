import { NextRequest, NextResponse } from 'next/server'
import { createQrisTransaction } from '@/lib/pakasir'
import { createTopup, getUser } from '@/lib/firestore'
import { verifyFirebaseToken } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let uid: string
  try {
    const decoded = await verifyFirebaseToken(token)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Token invalid' }, { status: 401 })
  }

  const { amount, method = 'qris' } = await req.json()
  if (!amount || amount < 10000) {
    return NextResponse.json({ error: 'Minimal top up Rp 10.000' }, { status: 400 })
  }

  try {
    const user = await getUser(uid)
    if (!user) throw new Error('User tidak ditemukan')

    const topupId = uuidv4()
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Call Pakasir
    const pakasirRes = await createQrisTransaction(topupId, amount)
    const qrisString = pakasirRes?.data?.qris_string ?? pakasirRes?.qris_string ?? ''
    const pakasirExpired = pakasirRes?.data?.expired_at ?? expiredAt.toISOString()

    // Save topup to Firestore
    await createTopup({
      topupId,
      uid,
      orderId: topupId,
      amount,
      method,
      status: 'PENDING',
      qrisString,
      expiredAt: new Date(pakasirExpired),
    })

    return NextResponse.json({
      topupId,
      amount,
      qrisString,
      expiredAt: pakasirExpired,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
