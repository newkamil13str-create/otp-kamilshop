'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err: any) {
      toast.error(err.code === 'auth/user-not-found' ? 'Email tidak terdaftar' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-bold"><span className="text-cyan-400">KAMIL</span><span className="text-white"> OTP</span></span>
          </Link>
        </div>

        <div className="glass p-8">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-xl font-bold mb-2">Lupa Password</h2>
                <p className="text-gray-500 text-sm mb-6">Masukkan email kamu, kami akan kirim link reset password.</p>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" className="input-field" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="text-5xl mb-4">📬</div>
                <h2 className="text-xl font-bold mb-2">Email Terkirim!</h2>
                <p className="text-gray-400 text-sm mb-6">Cek inbox <span className="text-cyan-400">{email}</span> dan klik link reset password.</p>
                <button onClick={() => setSent(false)} className="btn-ghost text-sm">Kirim ulang</button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-600 text-sm mt-6">
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300">← Kembali ke Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
