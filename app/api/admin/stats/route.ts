import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-guard'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)

    const [usersSnap, ordersSnap, topupsSnap] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('orders').count().get(),
      adminDb.collection('topups').where('status', '==', 'PAID').get(),
    ])

    const totalRevenue = topupsSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0)

    return NextResponse.json({
      totalUsers: usersSnap.data().count,
      totalOrders: ordersSnap.data().count,
      totalRevenue,
      totalTopups: topupsSnap.size,
    })
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message.startsWith('Forbidden') ? 403 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
