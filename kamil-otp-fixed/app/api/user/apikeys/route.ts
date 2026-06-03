import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { randomBytes } from 'crypto'

function generateApiKey(): string {
  return `kotp_${randomBytes(16).toString('hex')}`
}

async function getUid(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = await verifyFirebaseToken(token)
    return decoded.uid
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('apikeys').where('uid', '==', uid).get()
  const keys = snap.docs.map((d) => {
    const data = d.data()
    return {
      key: data.key,
      uid: data.uid,
      name: data.name,
      active: data.active,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      lastUsedAt: data.lastUsedAt?.toDate?.() ?? null,
    }
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json().catch(() => ({}))
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const existing = await adminDb.collection('apikeys').where('uid', '==', uid).get()
  if (existing.size >= 5) return NextResponse.json({ error: 'Maksimal 5 API key per akun' }, { status: 400 })
  const key = generateApiKey()
  await adminDb.collection('apikeys').doc(key).set({
    key, uid, name: name.trim(), active: true,
    createdAt: FieldValue.serverTimestamp(),
    lastUsedAt: null,
  })
  return NextResponse.json({ key })
}

export async function DELETE(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key } = await req.json().catch(() => ({}))
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  const snap = await adminDb.collection('apikeys').doc(key).get()
  if (!snap.exists || snap.data()?.uid !== uid) return NextResponse.json({ error: 'Key tidak ditemukan' }, { status: 404 })
  await adminDb.collection('apikeys').doc(key).delete()
  return NextResponse.json({ success: true })
}
