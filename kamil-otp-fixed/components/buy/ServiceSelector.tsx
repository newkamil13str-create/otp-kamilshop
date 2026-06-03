'use client'

import { motion } from 'framer-motion'
import { formatIDR, getServiceIcon } from '@/lib/utils'
import type { Service } from '@/types'

interface Props {
  services: Service[]
  value: string
  onChange: (name: string) => void
  loading?: boolean
}

export default function ServiceSelector({ services, value, onChange, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl card-shimmer bg-white/[0.02]" />
        ))}
      </div>
    )
  }

  if (!services.length) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-500 text-sm">Tidak ada layanan tersedia untuk negara ini</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
      {services.map((svc, i) => {
        const isSelected = svc.name === value
        const unavailable = svc.count === 0
        return (
          <motion.button
            key={svc.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            type="button"
            onClick={() => !unavailable && onChange(svc.name)}
            disabled={unavailable}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              isSelected
                ? 'bg-cyan-500/15 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : unavailable
                ? 'bg-white/[0.01] border-white/[0.04] opacity-40 cursor-not-allowed'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/20 cursor-pointer'
            }`}
          >
            {isSelected && (
              <span className="absolute top-2 right-2 text-cyan-400 text-xs font-bold">✓</span>
            )}
            <div className="text-2xl mb-2">{getServiceIcon(svc.name)}</div>
            <div className="text-sm font-medium capitalize truncate text-white">{svc.displayName ?? svc.name}</div>
            <div className={`text-sm font-mono font-semibold ${isSelected ? 'text-cyan-400' : 'text-cyan-500/80'}`}>
              {formatIDR(svc.priceIdr)}
            </div>
            <div className={`text-xs mt-0.5 ${svc.count < 10 ? 'text-orange-400' : 'text-gray-600'}`}>
              {unavailable ? 'Habis' : `${svc.count} tersedia`}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
