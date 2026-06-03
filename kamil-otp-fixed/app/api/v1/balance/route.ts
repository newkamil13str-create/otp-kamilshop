import { NextRequest, NextResponse } from 'next/server'
import { authByApiKey } from '@/lib/api-auth'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const auth = await authByApiKey(req)
  if (!auth) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })

  try {
    const snap = await adminDb.collection('users').doc(auth.uid).get()
    if (!snap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const balance = snap.data()?.balance ?? 0
    return NextResponse.json({ balance })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
