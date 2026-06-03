'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import type { User } from '@/types'

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

async function fetchOrCreateUser(fbUser: FirebaseUser): Promise<User | null> {
  try {
    const token = await fbUser.getIdToken()
    const res = await fetch('/api/user/me', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fbUser.email ?? '',
        displayName: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
        photoURL: fbUser.photoURL ?? '',
      }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function syncSessionCookie(fbUser: FirebaseUser | null) {
  if (fbUser) {
    const token = await fbUser.getIdToken()
    document.cookie = `firebase-session=${token}; path=/; max-age=3600; SameSite=Strict`
  } else {
    document.cookie = 'firebase-session=; path=/; max-age=0'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch {}
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      await syncSessionCookie(fbUser)
      if (fbUser) {
        const u = await fetchOrCreateUser(fbUser)
        setUser(u)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
    await syncSessionCookie(null)
    setUser(null)
    setFirebaseUser(null)
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
