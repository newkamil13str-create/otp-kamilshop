import { adminAuth, adminDb } from './firebase-admin'
import { NextRequest } from 'next/server'

export async function verifyAdmin(req: NextRequest): Promise<string> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) throw new Error('Unauthorized')

  const decoded = await adminAuth.verifyIdToken(token)
  const uid = decoded.uid

  const snap = await adminDb.collection('users').doc(uid).get()
  if (!snap.exists) throw new Error('User not found')
  if (snap.data()?.role !== 'admin') throw new Error('Forbidden: bukan admin')

  return uid
}
