'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'
import QRISModal from '@/components/topup/QRISModal'
import TopupHistory from '@/components/topup/TopupHistory'
import type { Topup } from '@/types'

const PRESETS = [10000, 25000, 50000, 100000, 250000, 500000]

export default function TopupPage() {
  const { user, firebaseUser, refreshUser } = useAuth()
  const [amount, setAmount] = useState(50000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [creating, setCreating] = useState(false)
  const [modal, setModal] = useState<{ qrisString: string; amount: number; expiredAt: string; topupId: string } | null>(null)
  const [history, setHistory] = useState<Topup[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    if (!user || !firebaseUser) return
    firebaseUser.getIdToken().then((token) => {
      fetch('/api/user/topups', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => setHistory(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoadingHistory(false))
    })
  }, [user, firebaseUser])

  const finalAmount = isCustom ? parseInt(customAmount || '0') : amount

  const handleCreate = async () => {
    if (finalAmount < 10000) { toast.error('Minimal top up Rp 10.000'); return }
    if (!firebaseUser) return
    setCreating(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: finalAmount, method: 'qris' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal({ qrisString: data.qrisString, amount: data.amount, expiredAt: data.expiredAt, topupId: data.topupId })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setModal(null)
    await refreshUser()
    const token = await firebaseUser!.getIdToken()
    const tops = await fetch('/api/user/topups', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => Array.isArray(d) ? d : []).catch(() => [])
    setHistory(tops)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold mb-1">Top Up Saldo</h1>
        <p className="text-gray-500 text-sm">Isi saldo via QRIS, cepat dan aman</p>
      </div>

      {/* Balance */}
      <div className="glass p-5 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-cyan-400">{formatIDR(user?.balance ?? 0)}</p>
        </div>
        <div className="text-4xl">💰</div>
      </div>

      {/* Amount selector */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
        <h2 className="font-semibold mb-4">Pilih Nominal</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setAmount(p); setIsCustom(false) }}
              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                !isCustom && amount === p
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {formatIDR(p)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCustom(!isCustom)}
          className={`w-full py-3 rounded-xl border text-sm font-medium transition-all mb-3 ${
            isCustom ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white'
          }`}
        >
          ✏️ Jumlah Lain
        </button>

        {isCustom && (
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Minimal 10.000"
              className="input-field pl-12"
              min={10000}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-white/[0.03]">
          <span className="text-gray-500 text-sm">Total yang akan ditambahkan</span>
          <span className="text-cyan-400 font-bold font-mono">{formatIDR(finalAmount)}</span>
        </div>

        <button onClick={handleCreate} disabled={creating || finalAmount < 10000} className="btn-primary w-full">
          {creating ? '⏳ Membuat transaksi...' : `📲 Bayar via QRIS — ${formatIDR(finalAmount)}`}
        </button>
      </motion.div>

      {/* QRIS Modal via component */}
      {modal && (
        <QRISModal
          qrisString={modal.qrisString}
          amount={modal.amount}
          expiredAt={modal.expiredAt}
          topupId={modal.topupId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setModal(null)}
        />
      )}

      {/* History via component */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
        <h2 className="font-semibold mb-4">📋 Riwayat Top Up</h2>
        <TopupHistory topups={history} loading={loadingHistory} />
      </motion.div>
    </div>
  )
}
