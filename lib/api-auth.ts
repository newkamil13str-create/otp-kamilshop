import { NextRequest } from 'next/server'
import { validateApiKey } from './apikey'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

// Ambil uid dari API key di header "x-api-key" atau query ?api_key=
export async function authByApiKey(req: NextRequest): Promise<{ uid: string } | null> {
  const key =
    req.headers.get('x-api-key') ??
    req.nextUrl.searchParams.get('api_key') ??
    null

  if (!key) return null

  const result = await validateApiKey(key)
  if (!result) return null

  // Update lastUsedAt (fire and forget)
  updateDoc(doc(db, 'apikeys', key), { lastUsedAt: serverTimestamp() }).catch(() => {})

  return { uid: result.uid }
}
