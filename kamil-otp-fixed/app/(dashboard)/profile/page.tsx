'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR, formatDate } from '@/lib/utils'
import type { ApiKey } from '@/types'

export default function ProfilePage() {
  const { user, firebaseUser } = useAuth()
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [changing, setChanging] = useState(false)

  // --- API Key state ---
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    return firebaseUser?.getIdToken() ?? null
  }, [firebaseUser])

  const fetchKeys = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    setLoadingKeys(true)
    try {
      const res = await fetch('/api/user/apikeys', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setApiKeys(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Gagal memuat API key')
    } finally {
      setLoadingKeys(false)
    }
  }, [getToken])

  useEffect(() => {
    if (firebaseUser) fetchKeys()
  }, [firebaseUser, fetchKeys])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) { toast.error('Masukkan nama untuk API key'); return }
    const token = await getToken()
    if (!token) return
    setCreating(true)
    try {
      const res = await fetch('/api/user/apikeys', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewlyCreatedKey(data.key)
      setNewKeyName('')
      await fetchKeys()
      toast.success('API key berhasil dibuat!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeKey = async (key: string) => {
    if (!confirm('Hapus API key ini? Akses menggunakan key ini akan langsung berhenti.')) return
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch('/api/user/apikeys', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (newlyCreatedKey === key) setNewlyCreatedKey(null)
      await fetchKeys()
      toast.success('API key dihapus')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const toggleVisible = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key disalin!')
  }

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) { toast.error('Password baru tidak cocok'); return }
    if (pwForm.next.length < 6) { toast.error('Password minimal 6 karakter'); return }
    if (!firebaseUser?.email) return
    setChanging(true)
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, pwForm.current)
      await reauthenticateWithCredential(firebaseUser, cred)
      await updatePassword(firebaseUser, pwForm.next)
      toast.success('Password berhasil diubah!')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      toast.error(err.code === 'auth/wrong-password' ? 'Password lama salah' : err.message)
    } finally {
      setChanging(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold mb-1">Profil Saya</h1>
        <p className="text-gray-500 text-sm">Informasi dan pengaturan akun kamu</p>
      </div>

      {/* Avatar + info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-gray-600 text-xs mt-1">
              Bergabung {user.createdAt ? formatDate(user.createdAt) : '—'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Saldo', value: formatIDR(user.balance), color: 'text-cyan-400' },
          { label: 'Total Top Up', value: formatIDR(user.totalTopup), color: 'text-violet-400' },
          { label: 'Total Belanja', value: formatIDR(user.totalSpent ?? 0), color: 'text-orange-400' },
        ].map((s) => (
          <div key={s.label} className="glass p-4 text-center">
            <p className="text-gray-600 text-xs mb-1">{s.label}</p>
            <p className={`font-bold text-sm font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* === API Key Section === */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-5 space-y-4">
        <div>
          <h2 className="font-semibold mb-0.5">🔐 API Key</h2>
          <p className="text-gray-500 text-xs">Gunakan API key untuk mengakses layanan virtual number secara programatik. Maksimal 5 key.</p>
        </div>

        {/* Newly created key banner */}
        {newlyCreatedKey && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
            <p className="text-green-400 text-xs font-semibold">✅ API key baru berhasil dibuat — salin sekarang, tidak akan ditampilkan lagi!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs text-green-300 font-mono break-all select-all">
                {newlyCreatedKey}
              </code>
              <button
                onClick={() => copyKey(newlyCreatedKey)}
                className="flex-shrink-0 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs transition-colors"
              >
                Salin
              </button>
            </div>
            <button onClick={() => setNewlyCreatedKey(null)} className="text-gray-500 text-xs hover:text-gray-400">Tutup</button>
          </div>
        )}

        {/* Generate new key */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nama key (misal: bot-telegram)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
            className="input-field flex-1 text-sm"
            maxLength={40}
          />
          <button
            onClick={handleCreateKey}
            disabled={creating || apiKeys.length >= 5}
            className="btn-primary text-sm px-4 flex-shrink-0 disabled:opacity-40"
          >
            {creating ? '...' : '+ Buat'}
          </button>
        </div>

        {/* Key list */}
        {loadingKeys ? (
          <div className="text-gray-500 text-sm text-center py-4">Memuat...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-gray-600 text-sm text-center py-4 border border-dashed border-gray-700 rounded-xl">
            Belum ada API key. Buat satu di atas.
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.key} className="bg-black/20 border border-gray-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{k.name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleVisible(k.key)}
                      className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      {visibleKeys.has(k.key) ? 'Sembunyikan' : 'Lihat'}
                    </button>
                    <button
                      onClick={() => copyKey(k.key)}
                      className="text-xs text-cyan-500 hover:text-cyan-400 px-2 py-1 rounded transition-colors"
                    >
                      Salin
                    </button>
                    <button
                      onClick={() => handleRevokeKey(k.key)}
                      className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                {visibleKeys.has(k.key) && (
                  <code className="block bg-black/30 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono break-all">
                    {k.key}
                  </code>
                )}
                <p className="text-gray-600 text-xs">
                  Dibuat: {k.createdAt ? formatDate(new Date(k.createdAt)) : '—'}
                  {k.lastUsedAt ? ` · Terakhir dipakai: ${formatDate(new Date(k.lastUsedAt))}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick docs */}
        <div className="bg-gray-900/50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
          <p className="text-gray-400 font-medium">Cara pakai:</p>
          <p>Header: <code className="text-cyan-400">x-api-key: kotp_xxx</code></p>
          <p>atau Query: <code className="text-cyan-400">?api_key=kotp_xxx</code></p>
          <p className="mt-1">
            Base URL: <code className="text-violet-400">{process.env.NEXT_PUBLIC_APP_URL ?? 'https://otp.kamilshop.my.id'}/api/v1</code>
          </p>
        </div>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5">
        <h2 className="font-semibold mb-4">🔑 Ganti Password</h2>
        <form onSubmit={handleChangePw} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Password Lama</label>
            <input type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Password Baru</label>
            <input type="password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Konfirmasi Password Baru</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} className="input-field" required />
          </div>
          <button type="submit" disabled={changing} className="btn-primary">
            {changing ? 'Memperbarui...' : 'Perbarui Password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
