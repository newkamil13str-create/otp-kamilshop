import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/server-utils'
import { createApiKey, getUserApiKeys, revokeApiKey } from '@/lib/apikey'

async function getUid(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = await verifyFirebaseToken(token)
    return decoded.uid
  } catch {
    return null
  }
}

// GET /api/user/apikeys — list semua key milik user
export async function GET(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await getUserApiKeys(uid)
  return NextResponse.json(keys)
}

// POST /api/user/apikeys — generate key baru
export async function POST(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

  // Max 5 API key per user
  const existing = await getUserApiKeys(uid)
  if (existing.length >= 5) {
    return NextResponse.json({ error: 'Maksimal 5 API key per akun' }, { status: 400 })
  }

  const key = await createApiKey(uid, name.trim())
  return NextResponse.json({ key })
}

// DELETE /api/user/apikeys — revoke key
export async function DELETE(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  const ok = await revokeApiKey(key, uid)
  if (!ok) return NextResponse.json({ error: 'Key tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ success: true })
}
