'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUser } from '@/lib/firestore'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const user = await getUser(cred.user.uid)
      if (!user || user.role !== 'admin') {
        await auth.signOut()
        setError('Akun ini tidak memiliki akses admin.')
        return
      }
      // Set session cookie
      const token = await cred.user.getIdToken()
      document.cookie = `firebase-session=${token}; path=/; max-age=3600; SameSite=Strict`
      router.push('/admin')
    } catch (err: any) {
      setError('Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">KAMIL OTP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Email Admin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/40"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/40"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Masuk...</>
              : '🔐 Masuk sebagai Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-700 mt-6">
          Bukan admin? <a href="/login" className="text-gray-500 hover:text-gray-400 transition-colors">Login user biasa</a>
        </p>
      </div>
    </div>
  )
}
