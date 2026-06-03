'use client'

import { formatIDR, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Topup } from '@/types'

interface Props {
  topups: Topup[]
  loading?: boolean
}

export default function TopupHistory({ topups, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl card-shimmer bg-white/[0.02]" />
        ))}
      </div>
    )
  }

  if (!topups.length) {
    return (
      <p className="text-gray-600 text-sm text-center py-8">
        Belum ada riwayat top up
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {topups.map((t) => (
        <div
          key={t.topupId}
          className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
              t.status === 'PAID' ? 'bg-green-500/15' : t.status === 'EXPIRED' ? 'bg-red-500/10' : 'bg-yellow-500/10'
            }`}>
              {t.status === 'PAID' ? '✅' : t.status === 'EXPIRED' ? '❌' : '⏳'}
            </div>
            <div>
              <p className="font-semibold font-mono text-white">{formatIDR(t.amount)}</p>
              <p className="text-xs text-gray-600">{formatDate(t.createdAt)} · QRIS</p>
            </div>
          </div>
          <span className={`status-badge ${getStatusColor(t.status)}`}>
            {getStatusLabel(t.status)}
          </span>
        </div>
      ))}
    </div>
  )
}
