'use client'

import Link from 'next/link'
import { formatIDR, getServiceIcon } from '@/lib/utils'

interface Props {
  country: string
  countryName: string
  countryFlag: string
  service: string
  operator: string
  price: number
  userBalance: number
  loading?: boolean
  onConfirm: () => void
}

export default function PriceCard({
  country, countryName, countryFlag, service, operator, price, userBalance, loading, onConfirm,
}: Props) {
  const insufficient = userBalance < price
  const balanceAfter = userBalance - price

  return (
    <div className="glass p-5 space-y-4">
      <h2 className="font-semibold text-white">🛒 Konfirmasi Pembelian</h2>

      {/* Details */}
      <div className="space-y-3 divide-y divide-white/[0.05]">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 text-sm">Layanan</span>
          <span className="flex items-center gap-2 font-medium capitalize">
            <span>{getServiceIcon(service)}</span>
            {service}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 text-sm">Negara</span>
          <span className="flex items-center gap-2 font-medium">
            <span>{countryFlag}</span>
            {countryName}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 text-sm">Operator</span>
          <span className="font-medium capitalize">{operator}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 text-sm">Harga</span>
          <span className="text-cyan-400 font-bold font-mono text-lg">{formatIDR(price)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 text-sm">Saldo sekarang</span>
          <span className="font-mono text-white">{formatIDR(userBalance)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 text-sm">Saldo setelah beli</span>
          <span className={`font-mono font-semibold ${insufficient ? 'text-red-400' : 'text-green-400'}`}>
            {insufficient ? '—' : formatIDR(balanceAfter)}
          </span>
        </div>
      </div>

      {/* Warning */}
      {insufficient && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <span>⚠️</span>
          <p>
            Saldo tidak cukup. Butuh{' '}
            <strong>{formatIDR(price - userBalance)}</strong> lagi.{' '}
            <Link href="/topup" className="underline underline-offset-2">Top up sekarang</Link>
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onConfirm}
        disabled={loading || insufficient}
        className="btn-primary w-full text-base py-3.5"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Memproses…
          </span>
        ) : (
          `🚀 Beli Nomor — ${formatIDR(price)}`
        )}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Saldo dipotong otomatis setelah nomor berhasil didapat dari server
      </p>
    </div>
  )
}
