import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-guard'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const limitCount = parseInt(req.nextUrl.searchParams.get('limit') ?? '100')

    const snap = await adminDb.collection('topups')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()

    const topups = snap.docs.map((d) => {
      const data = d.data()
      return {
        ...data,
        topupId: d.id,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? null,
        expiredAt: (data.expiredAt as Timestamp)?.toDate().toISOString() ?? null,
        paidAt: data.paidAt ? (data.paidAt as Timestamp).toDate().toISOString() : null,
      }
    })

    return NextResponse.json(topups)
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message.startsWith('Forbidden') ? 403 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
