import { NextRequest, NextResponse } from 'next/server'
import { authByApiKey } from '@/lib/api-auth'
import { buyNumber, applyMarkup } from '@/lib/rumahotp'
import { deductBalanceAndCreateOrder, getUser } from '@/lib/firestore'
import { rateLimit } from '@/lib/utils'

const rateLimitMap = new Map<string, number[]>()

export async function POST(req: NextRequest) {
  const auth = await authByApiKey(req)
  if (!auth) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })

  const { uid } = auth

  // Rate limit: 10 req/menit per user
  if (!rateLimit(rateLimitMap, uid, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const { service_id, country, operator_id, price } = body

  if (!service_id || !country) {
    return NextResponse.json({ error: 'service_id and country are required' }, { status: 400 })
  }

  try {
    const basePrice = parseFloat(price ?? '0')
    const priceIdr = applyMarkup(basePrice)

    const user = await getUser(uid)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.balance < priceIdr) {
      return NextResponse.json({
        error: `Insufficient balance. Balance: ${user.balance}, Required: ${priceIdr}`,
      }, { status: 400 })
    }

    const orderData = await buyNumber(service_id, country, operator_id)
    const orderId = String(orderData.id ?? orderData.order_id)

    await deductBalanceAndCreateOrder(uid, priceIdr, {
      orderId,
      uid,
      service: service_id,
      country,
      phone: orderData.number ?? orderData.phone,
      operator: orderData.operator ?? operator_id ?? 'any',
      price: priceIdr,
      priceRub: basePrice,
      status: 'PENDING',
      sms: [],
    })

    return NextResponse.json({
      order_id: orderId,
      phone: orderData.number ?? orderData.phone,
      status: 'PENDING',
      price: priceIdr,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
