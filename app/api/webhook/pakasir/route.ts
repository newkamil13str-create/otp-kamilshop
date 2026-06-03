import { NextRequest, NextResponse } from 'next/server'
import { getTopupByOrderId, addBalanceAndUpdateTopup } from '@/lib/firestore'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Pakasir Webhook]', body)

    // Pakasir biasanya mengirim: order_id, status, amount
    const orderId = body.order_id ?? body.orderId
    const status = body.status ?? body.payment_status

    if (!orderId) {
      return NextResponse.json({ error: 'order_id missing' }, { status: 400 })
    }

    // Only process successful payments
    const isPaid = status === 'paid' || status === 'success' || status === 'PAID' || status === 'SUCCESS'
    if (!isPaid) {
      return NextResponse.json({ received: true, skipped: true })
    }

    const topup = await getTopupByOrderId(orderId)
    if (!topup) {
      console.error('[Webhook] Topup not found for orderId:', orderId)
      return NextResponse.json({ error: 'Topup not found' }, { status: 404 })
    }

    if (topup.status === 'PAID') {
      // Already processed, idempotent
      return NextResponse.json({ received: true, already_paid: true })
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
