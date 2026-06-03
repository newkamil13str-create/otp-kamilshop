export async function verifyFirebaseToken(token: string) {
  const { adminAuth } = await import('./firebase-admin')
  return adminAuth.verifyIdToken(token)
}
