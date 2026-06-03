import { NextRequest, NextResponse } from 'next/server'
import { buyNumber, applyMarkup } from '@/lib/rumahotp'
import { deductBalanceAndCreateOrder, getUser } from '@/lib/firestore'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { rateLimit } from '@/lib/utils'

const rateLimitMap = new Map<string, number[]>()

export async function POST(req: NextRequest) {
  // Auth
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let uid: string
  try {
    const decoded = await verifyFirebaseToken(token)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Token invalid' }, { status: 401 })
  }

  // Rate limit: 10 request per menit per user
  if (!rateLimit(rateLimitMap, uid, 10, 60000)) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }, { status: 429 })
  }

  const { serviceId, serviceName, country, operatorId, priceRaw } = await req.json()
  if (!serviceId || !country) {
    return NextResponse.json({ error: 'serviceId & country required' }, { status: 400 })
  }

  try {
    // Hitung harga final
    const basePrice = parseFloat(priceRaw ?? '0')
    const priceIdr = applyMarkup(basePrice)

    // Cek saldo user
    const user = await getUser(uid)
    if (!user) throw new Error('User tidak ditemukan')
    if (user.balance < priceIdr) {
      throw new Error(`Saldo tidak cukup. Saldo: Rp${user.balance.toLocaleString()}, Harga: Rp${priceIdr.toLocaleString()}`)
    }

    // Beli nomor dari RumahOTP
    const orderData = await buyNumber(serviceId, country, operatorId)

    // orderId dari RumahOTP
    const orderId = String(orderData.id ?? orderData.order_id)

    // Potong saldo & simpan order
    await deductBalanceAndCreateOrder(uid, priceIdr, {
      orderId,
      uid,
      service: serviceName ?? serviceId,
      country,
      phone: orderData.number ?? orderData.phone,
      operator: orderData.operator ?? operatorId ?? 'any',
      price: priceIdr,
      priceRub: basePrice, // tetap simpan di field priceRub untuk kompatibilitas
      status: 'PENDING',
      sms: [],
    })

    return NextResponse.json({
      orderId,
      phone: orderData.number ?? orderData.phone,
      status: 'PENDING',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
