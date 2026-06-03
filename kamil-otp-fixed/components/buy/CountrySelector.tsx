'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Country } from '@/types'

interface Props {
  countries: Country[]
  value: string
  onChange: (iso: string) => void
  placeholder?: string
}

const REGION_ORDER = ['Asia Tenggara', 'Asia Selatan', 'Asia Timur', 'Eropa', 'Amerika', 'Lainnya']

export default function CountrySelector({ countries, value, onChange, placeholder = 'Pilih negara…' }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = countries.find((c) => c.iso === value)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.iso.toLowerCase().includes(search.toLowerCase())
  )

  // Group by region
  const grouped: Record<string, Country[]> = {}
  for (const c of filtered) {
    const region = c.region ?? 'Lainnya'
    if (!grouped[region]) grouped[region] = []
    grouped[region].push(c)
  }

  const orderedRegions = [...REGION_ORDER.filter((r) => grouped[r]), ...Object.keys(grouped).filter((r) => !REGION_ORDER.includes(r))]

  const select = (iso: string) => {
    onChange(iso)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field flex items-center justify-between text-left w-full"
      >
        {selected ? (
          <span className="flex items-center gap-2.5">
            <span className="text-xl">{selected.flag}</span>
            <span className="font-medium">{selected.name}</span>
            <span className="text-gray-600 text-xs">{selected.iso}</span>
          </span>
        ) : (
          <span className="text-gray-600">{placeholder}</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 glass border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-white/[0.06]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari negara…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-6">Negara tidak ditemukan</p>
              ) : (
                orderedRegions.map((region) => (
                  <div key={region}>
                    <p className="px-3 py-2 text-xs text-gray-600 font-medium uppercase tracking-wider bg-white/[0.02] sticky top-0">
                      {region}
                    </p>
                    {grouped[region].map((c) => (
                      <button
                        key={c.iso}
                        type="button"
                        onClick={() => select(c.iso)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/[0.06] transition-colors text-left ${
                          c.iso === value ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300'
                        }`}
                      >
                        <span className="text-xl w-7 text-center">{c.flag}</span>
                        <span className="font-medium flex-1">{c.name}</span>
                        <span className="text-gray-600 text-xs font-mono">{c.iso}</span>
                        {c.iso === value && <span className="text-cyan-400">✓</span>}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
