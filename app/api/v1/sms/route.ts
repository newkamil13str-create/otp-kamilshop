import { NextRequest, NextResponse } from 'next/server'
import { authByApiKey } from '@/lib/api-auth'
import { checkOrder } from '@/lib/rumahotp'
import { getOrder, updateOrder } from '@/lib/firestore'

function mapStatus(code: number | string): string {
  switch (Number(code)) {
    case 1: return 'PENDING'
    case 2: return 'RECEIVED'
    case 3: return 'EXPIRED'
    case 6: return 'CANCELED'
    case 8: return 'FINISHED'
    case 9: return 'BANNED'
    default: return 'PENDING'
  }
}

export async function GET(req: NextRequest) {
  const auth = await authByApiKey(req)
  if (!auth) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })

  const orderId = req.nextUrl.searchParams.get('order_id')
  if (!orderId) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  try {
    const order = await getOrder(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.uid !== auth.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (order.status === 'PENDING' || order.status === 'RECEIVED') {
      const data = await checkOrder(orderId)
      const newStatus = mapStatus(data.status ?? data.status_code)
      const newSms = data.sms
        ? (Array.isArray(data.sms) ? data.sms : [data.sms])
        : (data.code ? [{ text: data.code, code: data.code, sender: 'OTP', date: new Date().toISOString(), created_at: new Date().toISOString() }] : [])

      if (newStatus !== order.status || newSms.length !== order.sms.length) {
        await updateOrder(orderId, {
          status: newStatus,
          sms: newSms,
          ...(['FINISHED', 'CANCELED', 'EXPIRED'].includes(newStatus) ? { finishedAt: new Date() } : {}),
        })
        order.status = newStatus
        order.sms = newSms
      }
    }

    return NextResponse.json({
      order_id: order.orderId,
      phone: order.phone,
      status: order.status,
      sms: order.sms,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
