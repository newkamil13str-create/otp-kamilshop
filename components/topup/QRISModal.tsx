'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'

interface Props {
  qrisString: string
  amount: number
  expiredAt: string
  topupId: string
  onSuccess: () => void
  onClose: () => void
}

export default function QRISModal({ qrisString, amount, expiredAt, topupId, onSuccess, onClose }: Props) {
  const { firebaseUser } = useAuth()
  const [countdown, setCountdown] = useState('')
  const [expired, setExpired] = useState(false)
  const [checking, setChecking] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const left = new Date(expiredAt).getTime() - Date.now()
      if (left <= 0) {
        setExpired(true)
        setCountdown('KADALUWARSA')
        if (pollRef.current) clearInterval(pollRef.current)
        return
      }
      const m = Math.floor(left / 60000)
      const s = Math.floor((left % 60000) / 1000)
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiredAt])

  // Auto-check every 3 seconds
  useEffect(() => {
    if (expired) return
    pollRef.current = setInterval(checkPayment, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [expired])

  const checkPayment = async () => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/payment/check?topupId=${topupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.status === 'PAID') {
        if (pollRef.current) clearInterval(pollRef.current)
        toast.success(`🎉 Top up ${formatIDR(amount)} berhasil!`)
        onSuccess()
      }
    } catch {
      // silent
    }
  }

  const handleManualCheck = async () => {
    setChecking(true)
    await checkPayment()
    setChecking(false)
    if (!expired) toast('Belum ada konfirmasi pembayaran.', { icon: '⏳' })
  }

  const copyQris = () => {
    navigator.clipboard.writeText(qrisString)
    toast.success('QRIS string disalin!')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 20 }}
          className="glass w-full max-w-sm p-6 relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold mb-1">Bayar via QRIS</h3>
            <p className="text-gray-400 text-sm">
              Top up{' '}
              <span className="text-cyan-400 font-bold font-mono">{formatIDR(amount)}</span>
            </p>
          </div>

          {/* QR */}
          <div className="flex justify-center mb-4">
            {expired ? (
              <div className="w-[200px] h-[200px] bg-white/5 border border-red-500/30 rounded-xl flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">⏰</span>
                <span className="text-red-400 font-medium text-sm">QR Kadaluwarsa</span>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-xl shadow-lg shadow-cyan-500/10">
                <QRCodeSVG
                  value={qrisString}
                  size={190}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className={`text-center mb-5 ${expired ? 'text-red-400' : 'text-orange-400'}`}>
            <span className="text-xs text-gray-500 block mb-0.5">Sisa waktu</span>
            <span className="text-2xl font-mono font-bold">{countdown}</span>
          </div>

          {/* Instructions */}
          <div className="bg-white/[0.03] rounded-xl p-3 mb-4 space-y-1 text-xs text-gray-500">
            <p>1. Buka aplikasi m-banking atau e-wallet</p>
            <p>2. Pilih menu <strong className="text-gray-300">Bayar / Scan QR</strong></p>
            <p>3. Scan QR di atas atau paste QRIS string</p>
            <p>4. Konfirmasi pembayaran di aplikasi kamu</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {!expired ? (
              <button
                onClick={handleManualCheck}
                disabled={checking}
                className="btn-primary w-full"
              >
                {checking ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengecek…
                  </span>
                ) : (
                  '✅ Sudah Bayar — Cek Sekarang'
                )}
              </button>
            ) : (
              <button onClick={onClose} className="btn-secondary w-full">
                Tutup & Buat QR Baru
              </button>
            )}

            <button
              onClick={copyQris}
              className="btn-ghost w-full text-sm text-gray-400"
            >
              📋 Salin QRIS String
            </button>
          </div>

          {/* Auto-poll indicator */}
          {!expired && (
            <p className="text-center text-xs text-gray-600 mt-3 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse inline-block" />
              Mengecek pembayaran otomatis setiap 3 detik
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
