import { NextRequest, NextResponse } from 'next/server'
import { checkOrder } from '@/lib/rumahotp'
import { getOrder, updateOrder } from '@/lib/firestore'
import { verifyFirebaseToken } from '@/lib/utils'

// Map status code RumahOTP ke status internal
function mapStatus(statusCode: number | string): string {
  const code = Number(statusCode)
  // RumahOTP: 1=waiting, 2=received(sms masuk), 3=expired, 6=canceled, 8=finished, 9=banned
  switch (code) {
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
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let uid: string
  try {
    const decoded = await verifyFirebaseToken(token)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Token invalid' }, { status: 401 })
  }

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  try {
    // Validasi order milik user
    const order = await getOrder(orderId)
    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (order.uid !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Hanya poll RumahOTP jika masih aktif
    if (order.status === 'PENDING' || order.status === 'RECEIVED') {
      const data = await checkOrder(orderId)

      const newStatus = mapStatus(data.status ?? data.status_code)
      // SMS dari RumahOTP: data.sms atau data.code
      const newSms = data.sms
        ? (Array.isArray(data.sms) ? data.sms : [data.sms])
        : (data.code ? [{ text: data.code, code: data.code, sender: 'OTP', date: new Date().toISOString(), created_at: new Date().toISOString() }] : [])

      if (newStatus !== order.status || newSms.length !== order.sms.length) {
        await updateOrder(orderId, {
          status: newStatus,
          sms: newSms,
          ...(newStatus === 'FINISHED' || newStatus === 'CANCELED' || newStatus === 'EXPIRED'
            ? { finishedAt: new Date() }
            : {}),
        })
        order.status = newStatus
        order.sms = newSms
      }
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
