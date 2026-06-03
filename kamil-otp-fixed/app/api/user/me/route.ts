import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await verifyFirebaseToken(token)
    const ref = adminDb.collection('users').doc(decoded.uid)
    const snap = await ref.get()
    if (!snap.exists) return NextResponse.json(null)
    const data = snap.data()!
    ref.update({ lastLogin: FieldValue.serverTimestamp() }).catch(() => {})
    return NextResponse.json({
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await verifyFirebaseToken(token)
    const { displayName, email, photoURL } = await req.json()
    const ref = adminDb.collection('users').doc(decoded.uid)
    const snap = await ref.get()
    if (!snap.exists) {
      await ref.set({
        uid: decoded.uid,
        email: email ?? '',
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
        balance: 0,
        totalTopup: 0,
        totalSpent: 0,
        role: 'user',
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
      })
    } else {
      await ref.update({ lastLogin: FieldValue.serverTimestamp() })
    }
    const updated = await ref.get()
    const data = updated.data()!
    return NextResponse.json({
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
