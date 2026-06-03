'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'

interface AdminTopup {
  topupId: string; uid: string; amount: number; status: string; createdAt: string; paidAt: string | null
}

const STATUS_STYLE: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  EXPIRED: 'bg-gray-500/20 text-gray-500',
}

export default function AdminTopupsPage() {
  const { firebaseUser } = useAuth()
  const [topups, setTopups] = useState<AdminTopup[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (!firebaseUser) return
    firebaseUser.getIdToken().then((token) =>
      fetch('/api/admin/topups?limit=200', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { setTopups(Array.isArray(d) ? d : []); setLoading(false) })
    )
  }, [firebaseUser])

  const filtered = filter === 'ALL' ? topups : topups.filter((t) => t.status === filter)
  const totalPaid = topups.filter((t) => t.status === 'PAID').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Topups</h1>
        <p className="text-sm text-gray-500">{topups.length} total | Revenue: <span className="text-green-400 font-medium">{formatIDR(totalPaid)}</span></p>
      </div>

      <div className="flex gap-2">
        {['ALL', 'PAID', 'PENDING', 'EXPIRED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-white/[0.04] text-gray-500 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.02] animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">ID</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Jumlah</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Dibuat</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Dibayar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.topupId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.topupId.slice(0, 12)}…</td>
                  <td className="px-4 py-3 text-right font-bold text-green-400">{formatIDR(t.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[t.status] ?? 'bg-gray-500/20 text-gray-500'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-500">
                    {t.paidAt ? new Date(t.paidAt).toLocaleDateString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-600">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
