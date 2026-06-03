'use client'

import Link from 'next/link'
import { formatIDR, formatDate, getStatusColor, getStatusLabel, getServiceIcon } from '@/lib/utils'
import type { Order } from '@/types'

interface Props {
  orders: Order[]
  loading?: boolean
}

export default function RecentOrders({ orders, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl card-shimmer bg-white/[0.02]" />
        ))}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-3">📱</p>
        <p className="text-gray-500 text-sm mb-4">Belum ada order</p>
        <Link href="/buy" className="btn-primary text-sm px-6 py-2.5 inline-block">
          Beli Nomor Pertama
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Layanan', 'Nomor', 'Harga', 'Status', 'Waktu'].map((h) => (
              <th key={h} className="text-left text-gray-600 font-medium pb-3 px-1">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {orders.map((o) => (
            <tr key={o.orderId} className="hover:bg-white/[0.02] transition-colors group">
              <td className="py-3 px-1">
                <Link href={`/orders/${o.orderId}`} className="flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                  <span className="text-lg">{getServiceIcon(o.service)}</span>
                  <div>
                    <p className="font-medium capitalize text-white">{o.service}</p>
                    <p className="text-gray-600 text-xs capitalize">{o.country}</p>
                  </div>
                </Link>
              </td>
              <td className="py-3 px-1 font-mono text-gray-400 text-xs">{o.phone}</td>
              <td className="py-3 px-1 font-mono text-cyan-400 font-medium">{formatIDR(o.price)}</td>
              <td className="py-3 px-1">
                <span className={`status-badge ${getStatusColor(o.status)}`}>
                  {o.status === 'PENDING' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                  {getStatusLabel(o.status)}
                </span>
              </td>
              <td className="py-3 px-1 text-gray-600 text-xs whitespace-nowrap">
                {formatDate(o.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
