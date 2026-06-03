'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Selamat datang kembali!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Email atau password salah'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
      const p = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider()
      await signInWithPopup(auth, p)
      toast.success('Berhasil masuk!')
      router.push('/dashboard')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="24" height="16" rx="3" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
              <rect x="5" y="9" width="18" height="10" rx="1.5" fill="rgba(6,182,212,0.1)"/>
              <circle cx="9" cy="14" r="1.5" fill="#06B6D4"/>
              <circle cx="14" cy="14" r="1.5" fill="#7C3AED"/>
              <circle cx="19" cy="14" r="1.5" fill="#06B6D4"/>
            </svg>
            <span className="text-xl font-bold">
              <span className="text-cyan-400">KAMIL</span>
              <span className="text-white"> OTP</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Masuk ke akun kamu</p>
        </div>

        <div className="glass p-8">
          {/* OAuth buttons — prioritas di atas */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">atau dengan email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                Lupa password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Daftar gratis
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
