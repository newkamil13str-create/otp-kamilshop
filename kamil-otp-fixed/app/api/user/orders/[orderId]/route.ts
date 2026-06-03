import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await verifyFirebaseToken(token)
    const snap = await adminDb.collection('orders').doc(params.orderId).get()
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = snap.data()!
    if (data.uid !== decoded.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      finishedAt: data.finishedAt ? (data.finishedAt as Timestamp)?.toDate?.()?.toISOString() : null,
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
