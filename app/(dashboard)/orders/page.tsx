'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserOrders } from '@/lib/firestore'
import { formatIDR, formatDate, getStatusColor, getStatusLabel, getServiceIcon } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Menunggu SMS', value: 'PENDING' },
  { label: 'SMS Diterima', value: 'RECEIVED' },
  { label: 'Selesai', value: 'FINISHED' },
  { label: 'Dibatalkan', value: 'CANCELED' },
]

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL')

  useEffect(() => {
    if (!user) return
    getUserOrders(user.uid, 50).then(setOrders).finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold mb-1">Riwayat Order</h1>
        <p className="text-gray-500 text-sm">Semua transaksi pembelian nomor OTP kamu</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl card-shimmer bg-white/[0.02]" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">Tidak ada order ditemukan</p>
            <Link href="/buy" className="btn-primary text-sm mt-4 inline-block px-6 py-2.5">Beli Nomor</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {['Layanan', 'Nomor', 'Harga', 'Status', 'Waktu', ''].map((h) => (
                    <th key={h} className="text-left text-gray-600 font-medium px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((order) => (
                  <tr key={order.orderId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getServiceIcon(order.service)}</span>
                        <div>
                          <p className="font-medium capitalize">{order.service}</p>
                          <p className="text-gray-600 text-xs capitalize">{order.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-300 text-xs">{order.phone}</td>
                    <td className="px-5 py-4 text-cyan-400 font-mono">{formatIDR(order.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/orders/${order.orderId}`} className="text-cyan-400 hover:text-cyan-300 text-sm">Detail →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
