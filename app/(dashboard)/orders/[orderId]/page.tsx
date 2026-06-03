'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { getOrder } from '@/lib/firestore'
import { formatIDR, formatDate, getStatusColor, getStatusLabel, highlightOTP, extractOTP } from '@/lib/utils'
import type { Order } from '@/types'

const ACTIVE_STATUSES = ['PENDING', 'RECEIVED']

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const { firebaseUser, refreshUser } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [countdown, setCountdown] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!firebaseUser || !orderId) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/rumahotp/sms?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
      }
    } catch {
      // fallback to firestore
      const o = await getOrder(orderId)
      if (o) setOrder(o)
    }
  }, [firebaseUser, orderId])

  // Initial load
  useEffect(() => {
    getOrder(orderId).then((o) => { setOrder(o); setLoading(false) })
  }, [orderId])

  // Auto-refresh every 5s if active
  useEffect(() => {
    if (!order || !ACTIVE_STATUSES.includes(order.status)) return
    const interval = setInterval(fetchOrder, 5000)
    return () => clearInterval(interval)
  }, [order?.status, fetchOrder])

  // Countdown timer (20 min from creation)
  useEffect(() => {
    if (!order) return
    const tick = () => {
      const created = new Date(order.createdAt).getTime()
      const expires = created + 20 * 60 * 1000
      const left = expires - Date.now()
      if (left <= 0) { setCountdown('Kedaluwarsa'); return }
      const m = Math.floor(left / 60000)
      const s = Math.floor((left % 60000) / 1000)
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [order?.createdAt])

  const doAction = async (action: 'finish' | 'cancel' | 'ban') => {
    if (!firebaseUser) return
    setActionLoading(action)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/rumahotp/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(action === 'finish' ? 'Order diselesaikan' : action === 'cancel' ? 'Order dibatalkan' : 'Nomor di-ban')
      await fetchOrder()
      if (action === 'cancel') await refreshUser()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading('')
    }
  }

  const copyPhone = () => {
    if (!order?.phone) return
    navigator.clipboard.writeText(order.phone)
    setCopied(true)
    toast.success('Nomor disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Order tidak ditemukan</p>
        <button onClick={() => router.push('/orders')} className="btn-secondary mt-4">← Kembali</button>
      </div>
    )
  }

  const isActive = ACTIVE_STATUSES.includes(order.status)
  const latestSMS = order.sms?.[order.sms.length - 1]
  const otp = latestSMS ? extractOTP(latestSMS.text) : null

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => router.push('/orders')} className="btn-ghost text-sm flex items-center gap-2">
        ← Kembali ke Riwayat
      </button>

      {/* Phone number card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
        <div className="relative">
          <p className="text-gray-500 text-sm mb-2">Nomor Telepon Kamu</p>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-white mb-4 tracking-wider">
            {order.phone}
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={copyPhone} className={`btn-primary px-6 py-2.5 text-sm ${copied ? 'from-green-500 to-green-600' : ''}`}>
              {copied ? '✓ Disalin!' : '📋 Salin Nomor'}
            </button>
            <span className={`status-badge ${getStatusColor(order.status)} ${isActive ? 'animate-pulse-glow' : ''}`}>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Info row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Layanan', value: order.service, cls: 'capitalize' },
          { label: 'Negara', value: order.country, cls: 'capitalize' },
          { label: 'Harga', value: formatIDR(order.price), cls: 'text-cyan-400 font-mono' },
          { label: isActive ? 'Sisa Waktu' : 'Dibuat', value: isActive ? countdown : formatDate(order.createdAt), cls: isActive ? 'text-orange-400 font-mono' : '' },
        ].map((item) => (
          <div key={item.label} className="glass p-4">
            <p className="text-gray-600 text-xs mb-1">{item.label}</p>
            <p className={`text-sm font-medium ${item.cls}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* OTP highlight */}
      {otp && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-5 border border-cyan-500/30 bg-cyan-500/5">
          <p className="text-sm text-gray-400 mb-2">🔑 Kode OTP Terdeteksi</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-mono font-bold text-cyan-400 tracking-widest">{otp}</span>
            <button onClick={() => { navigator.clipboard.writeText(otp); toast.success('OTP disalin!') }} className="btn-secondary py-2 px-4 text-sm">
              Salin OTP
            </button>
          </div>
        </motion.div>
      )}

      {/* SMS Box */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">📨 Kotak SMS</h2>
          {isActive && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Auto-refresh setiap 5 detik
            </div>
          )}
        </div>

        {(!order.sms || order.sms.length === 0) ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 text-sm">
              {isActive ? 'Menunggu SMS masuk...' : 'Tidak ada SMS diterima'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {order.sms.map((sms, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-600">Dari: {sms.sender}</span>
                  <span className="text-xs text-gray-600">{sms.created_at}</span>
                </div>
                <p
                  className="text-sm text-white leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightOTP(sms.text) }}
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      {isActive && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
          <h2 className="font-semibold mb-4">⚙️ Aksi Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => doAction('finish')} disabled={!!actionLoading} className="btn-primary text-sm py-2.5">
              {actionLoading === 'finish' ? '...' : '✅ Selesaikan'}
            </button>
            <button onClick={() => doAction('cancel')} disabled={!!actionLoading} className="btn-secondary text-sm py-2.5 text-orange-400 border-orange-500/20 hover:border-orange-500/40">
              {actionLoading === 'cancel' ? '...' : '❌ Batalkan'}
            </button>
            <button onClick={() => doAction('ban')} disabled={!!actionLoading} className="btn-secondary text-sm py-2.5 text-red-400 border-red-500/20 hover:border-red-500/40">
              {actionLoading === 'ban' ? '...' : '🚫 Ban Nomor'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            * Batalkan untuk refund saldo jika SMS tidak kunjung datang. Ban jika nomor terblokir layanan.
          </p>
        </motion.div>
      )}
    </div>
  )
}
