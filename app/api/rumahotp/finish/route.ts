import { NextRequest, NextResponse } from 'next/server'
import { setOrderStatus } from '@/lib/rumahotp'
import { getOrder, updateOrder, updateUserBalance, getUser } from '@/lib/firestore'
import { verifyFirebaseToken } from '@/lib/utils'

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

  const { orderId, action } = await req.json()
  if (!orderId || !action) {
    return NextResponse.json({ error: 'orderId & action required' }, { status: 400 })
  }

  try {
    const order = await getOrder(orderId)
    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    if (order.uid !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let newStatus = order.status

    if (action === 'finish') {
      await setOrderStatus(orderId, 'finish')
      newStatus = 'FINISHED'
    } else if (action === 'cancel') {
      await setOrderStatus(orderId, 'cancel')
      newStatus = 'CANCELED'
      // Refund saldo
      const user = await getUser(uid)
      if (user) {
        await updateUserBalance(uid, user.balance + order.price)
      }
    } else if (action === 'ban') {
      await setOrderStatus(orderId, 'ban')
      newStatus = 'BANNED'
    } else {
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
    }

    await updateOrder(orderId, { status: newStatus, finishedAt: new Date() })
    return NextResponse.json({ success: true, status: newStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
