import { NextRequest, NextResponse } from 'next/server'
import { authByApiKey } from '@/lib/api-auth'
import { setOrderStatus } from '@/lib/rumahotp'
import { getOrder, updateOrder, getUser, updateUserBalance } from '@/lib/firestore'
import type { OrderStatus } from '@/types'

export async function POST(req: NextRequest) {
  const auth = await authByApiKey(req)
  if (!auth) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { order_id, action } = body

  if (!order_id || !action) {
    return NextResponse.json({ error: 'order_id and action are required' }, { status: 400 })
  }
  if (!['finish', 'cancel', 'ban'].includes(action)) {
    return NextResponse.json({ error: 'action must be: finish | cancel | ban' }, { status: 400 })
  }

  try {
    const order = await getOrder(order_id)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.uid !== auth.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await setOrderStatus(order_id, action as 'finish' | 'cancel' | 'ban')
    const statusMap: Record<string, OrderStatus> = { finish: 'FINISHED', cancel: 'CANCELED', ban: 'BANNED' }
    const newStatus = statusMap[action]

    if (action === 'cancel') {
      const user = await getUser(auth.uid)
      if (user) await updateUserBalance(auth.uid, user.balance + order.price)
    }

    await updateOrder(order_id, { status: newStatus, finishedAt: new Date() })
    return NextResponse.json({ success: true, status: newStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
