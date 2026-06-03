import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ApiKey } from '@/types'

// Generate random API key: "kotp_" + 32 hex chars
export function generateApiKey(): string {
  const { randomBytes } = require('crypto')
  const hex = randomBytes(16).toString('hex')
  return `kotp_${hex}`
}

// Simpan API key baru ke Firestore
export async function createApiKey(uid: string, name: string): Promise<string> {
  const key = generateApiKey()
  const keyId = key // pakai key sebagai document ID supaya lookup O(1)
  await setDoc(doc(db, 'apikeys', keyId), {
    key,
    uid,
    name,
    active: true,
    createdAt: serverTimestamp(),
    lastUsedAt: null,
  })
  return key
}

// Validasi API key & kembalikan uid pemilik (null jika invalid)
export async function validateApiKey(key: string): Promise<{ uid: string; name: string } | null> {
  const snap = await getDoc(doc(db, 'apikeys', key))
  if (!snap.exists()) return null
  const data = snap.data()
  if (!data.active) return null
  return { uid: data.uid, name: data.name }
}

// Ambil semua API key milik user
export async function getUserApiKeys(uid: string): Promise<ApiKey[]> {
  const q = query(collection(db, 'apikeys'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      key: data.key,
      uid: data.uid,
      name: data.name,
      active: data.active,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      lastUsedAt: data.lastUsedAt ? (data.lastUsedAt as Timestamp).toDate() : undefined,
    } as ApiKey
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Hapus / revoke API key
export async function revokeApiKey(key: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'apikeys', key))
  if (!snap.exists()) return false
  if (snap.data().uid !== uid) return false
  await deleteDoc(doc(db, 'apikeys', key))
  return true
}
