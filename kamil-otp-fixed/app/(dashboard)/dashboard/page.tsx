'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import BalanceCard from '@/components/dashboard/BalanceCard'
import RecentOrders from '@/components/dashboard/RecentOrders'
import type { Order } from '@/types'

const QUICK_SERVICES = [
  { name: 'Telegram', icon: '✈️', country: 'indonesia', service: 'telegram' },
  { name: 'WhatsApp', icon: '💬', country: 'indonesia', service: 'whatsapp' },
  { name: 'Google', icon: '🔍', country: 'russia', service: 'google' },
  { name: 'Facebook', icon: '📘', country: 'russia', service: 'facebook' },
  { name: 'Instagram', icon: '📸', country: 'russia', service: 'instagram' },
  { name: 'TikTok', icon: '🎵', country: 'russia', service: 'tiktok' },
]

export default function DashboardPage() {
  const { user, firebaseUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!firebaseUser) return
    firebaseUser.getIdToken().then((token) => {
      fetch('/api/user/orders?limit=5', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false))
    })
  }, [firebaseUser])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BalanceCard
        balance={user?.balance ?? 0}
        totalTopup={user?.totalTopup ?? 0}
        totalSpent={user?.totalSpent ?? 0}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5">
          <p className="text-gray-500 text-sm mb-1">Total Order</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
          <p className="text-xs text-gray-600 mt-1">Sepanjang waktu</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-5">
          <p className="text-gray-500 text-sm mb-1">Order Aktif</p>
          <p className="text-2xl font-bold text-violet-400">
            {orders.filter((o) => o.status === 'PENDING' || o.status === 'RECEIVED').length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Sedang berjalan</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5 col-span-2 sm:col-span-1">
          <p className="text-gray-500 text-sm mb-1">Berhasil</p>
          <p className="text-2xl font-bold text-green-400">
            {orders.filter((o) => o.status === 'FINISHED' || o.status === 'RECEIVED').length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Order selesai</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">⚡ Beli Cepat</h2>
          <Link href="/buy" className="text-sm text-cyan-400 hover:text-cyan-300">Lihat semua →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_SERVICES.map((s) => (
            <Link
              key={s.name}
              href={`/buy?country=${s.country}&service=${s.service}`}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-cyan-500/20 transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{s.name}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">📋 Order Terbaru</h2>
          <Link href="/orders" className="text-sm text-cyan-400 hover:text-cyan-300">Lihat semua →</Link>
        </div>
        <RecentOrders orders={orders} loading={loadingOrders} />
      </motion.div>
    </div>
  )
}
