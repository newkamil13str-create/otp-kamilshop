import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { getUserTopups } from '@/lib/firestore'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const decoded = await verifyFirebaseToken(token)
    const topups = await getUserTopups(decoded.uid, 10)
    return NextResponse.json(topups)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
