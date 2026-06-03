import { NextRequest } from 'next/server'
import { adminDb } from './firebase-admin'

export async function authByApiKey(req: NextRequest): Promise<{ uid: string } | null> {
  const key =
    req.headers.get('x-api-key') ??
    req.nextUrl.searchParams.get('api_key') ??
    null

  if (!key) return null

  const snap = await adminDb.collection('apikeys').doc(key).get()
  if (!snap.exists) return null
  const data = snap.data()!
  if (!data.active) return null

  // Update lastUsedAt (fire and forget)
  adminDb.collection('apikeys').doc(key).update({ lastUsedAt: new Date() }).catch(() => {})

  return { uid: data.uid }
}
