'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

interface AdminOrder {
  orderId: string; uid: string; service: string; country: string
  phone: string; price: number; status: string; createdAt: string
}

export default function AdminOrdersPage() {
  const { firebaseUser } = useAuth()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!firebaseUser) return
    firebaseUser.getIdToken().then((token) =>
      fetch('/api/admin/orders?limit=200', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
    )
  }, [firebaseUser])

  const filtered = orders.filter((o) =>
    o.phone?.includes(search) || o.service?.toLowerCase().includes(search.toLowerCase()) ||
    o.uid?.includes(search) || o.country?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} total order</p>
      </div>

      <input
        type="text"
        placeholder="Cari nomor, service, negara, UID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40"
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.02] animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Nomor / Service</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Negara</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Harga</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.orderId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-white text-xs">{o.phone}</p>
                    <p className="text-xs text-gray-500 capitalize">{o.service}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 capitalize">{o.country}</td>
                  <td className="px-4 py-3 text-right text-cyan-400 text-xs font-medium">{formatIDR(o.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(o.status as any)}`}>
                      {getStatusLabel(o.status as any)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-600">Tidak ada order</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
