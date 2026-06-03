'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'

interface Stats { totalUsers: number; totalOrders: number; totalRevenue: number; totalTopups: number }

export default function AdminDashboard() {
  const { firebaseUser } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseUser) return
    firebaseUser.getIdToken().then((token) =>
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(setStats)
        .finally(() => setLoading(false))
    )
  }, [firebaseUser])

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: '👥', fmt: (v: number) => v.toLocaleString() },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: '📋', fmt: (v: number) => v.toLocaleString() },
    { label: 'Total Topup Sukses', value: stats?.totalTopups ?? 0, icon: '💳', fmt: (v: number) => v.toLocaleString() },
    { label: 'Total Revenue', value: stats?.totalRevenue ?? 0, icon: '💰', fmt: (v: number) => formatIDR(v) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview KAMIL OTP</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="text-2xl mb-2">{c.icon}</div>
            {loading
              ? <div className="h-7 w-24 rounded-lg bg-white/[0.04] animate-pulse mb-1" />
              : <p className="text-xl font-bold text-white">{c.fmt(c.value)}</p>}
            <p className="text-xs text-gray-600">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
        <h2 className="font-semibold mb-4 text-sm text-gray-300">Menu Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/users', label: 'Kelola Users', icon: '👥', desc: 'Lihat & edit role/saldo' },
            { href: '/admin/orders', label: 'Semua Orders', icon: '📋', desc: 'Monitor transaksi OTP' },
            { href: '/admin/topups', label: 'Riwayat Topup', icon: '💳', desc: 'Cek deposit masuk' },
          ].map((m) => (
            <a key={m.href} href={m.href}
              className="flex gap-3 items-start p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-red-500/10 hover:border-red-500/20 transition-all">
              <span className="text-xl">{m.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{m.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
