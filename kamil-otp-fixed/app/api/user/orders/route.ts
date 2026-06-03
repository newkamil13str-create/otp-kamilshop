import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await verifyFirebaseToken(token)
    const limitParam = req.nextUrl.searchParams.get('limit') ?? '50'
    const snap = await adminDb.collection('orders')
      .where('uid', '==', decoded.uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limitParam))
      .get()
    const orders = snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        finishedAt: data.finishedAt ? (data.finishedAt as Timestamp)?.toDate?.()?.toISOString() : null,
      }
    })
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
