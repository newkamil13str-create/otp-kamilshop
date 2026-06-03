import { NextRequest, NextResponse } from 'next/server'
import { getTopupByOrderId, addBalanceAndUpdateTopup } from '@/lib/firestore'

const PAKASIR_BASE = 'https://app.pakasir.com/api'
const PAKASIR_SLUG = process.env.PAKASIR_SLUG!
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY!

// Verifikasi ulang status transaksi langsung ke Pakasir API
async function verifyWithPakasir(orderId: string, expectedAmount: number): Promise<boolean> {
  try {
    const res = await fetch(
      `${PAKASIR_BASE}/transactiondetail?project=${PAKASIR_SLUG}&amount=${expectedAmount}&order_id=${orderId}&api_key=${PAKASIR_API_KEY}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return false
    const data = await res.json()
    // Pakasir returns status "completed" saat sudah dibayar
    return data?.status === 'completed' || data?.payment?.status === 'completed'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Pakasir Webhook]', body)

    // Pakasir payload: { order_id, amount, project, status, payment_method, completed_at }
    const orderId = body.order_id ?? body.orderId
    const status = body.status

    if (!orderId) {
      return NextResponse.json({ error: 'order_id missing' }, { status: 400 })
    }

    // Cek status dari webhook
    const isPaid = status === 'completed' || status === 'paid' || status === 'success' || status === 'PAID'
    if (!isPaid) {
      return NextResponse.json({ received: true, skipped: true })
    }

    const topup = await getTopupByOrderId(orderId)
    if (!topup) {
      console.error('[Webhook] Topup not found for orderId:', orderId)
      return NextResponse.json({ error: 'Topup not found' }, { status: 404 })
    }

    if (topup.status === 'PAID') {
      return NextResponse.json({ received: true, already_paid: true })
    }

    // Double-check ke Pakasir API untuk mencegah webhook palsu
    const verified = await verifyWithPakasir(orderId, topup.amount)
    if (!verified) {
      console.warn('[Webhook] Verification failed for orderId:', orderId)
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Add balance atomically
    await addBalanceAndUpdateTopup(topup.uid, topup.amount, topup.topupId, orderId)

    console.log(`[Webhook] Balance +${topup.amount} for uid ${topup.uid}`)
    return NextResponse.json({ received: true, success: true })
  } catch (err: any) {
    console.error('[Webhook Error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
