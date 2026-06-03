'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatIDR } from '@/lib/utils'

interface Props {
  balance: number
  totalTopup: number
  totalSpent: number
}

export default function BalanceCard({ balance, totalTopup, totalSpent }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(124,58,237,0.15) 100%)',
        border: '1px solid rgba(6,182,212,0.2)',
      }}
    >
      {/* Glow blobs */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <p className="text-gray-400 text-sm mb-1">Saldo Tersedia</p>
        <p className="text-4xl font-bold text-white font-mono mb-4">{formatIDR(balance)}</p>

        <div className="flex gap-6 mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Top Up</p>
            <p className="text-sm font-semibold text-violet-400 font-mono">{formatIDR(totalTopup)}</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Belanja</p>
            <p className="text-sm font-semibold text-orange-400 font-mono">{formatIDR(totalSpent)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/topup" className="btn-primary text-sm py-2.5 px-5">
            + Top Up
          </Link>
          <Link href="/buy" className="btn-secondary text-sm py-2.5 px-5">
            🛒 Beli Nomor
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
