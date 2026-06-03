'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/buy', icon: '📱', label: 'Beli Nomor' },
  { href: '/orders', icon: '📋', label: 'Riwayat Order' },
  { href: '/topup', icon: '💳', label: 'Top Up Saldo' },
  { href: '/profile', icon: '👤', label: 'Profil' },
  { href: '/docs', icon: '📖', label: 'Panduan' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden glass p-2.5 rounded-xl"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h12M3 12h12M3 18h12" strokeLinecap="round"/>
        </svg>
      </button>

      <aside className={`fixed left-0 top-0 h-full w-64 z-40 border-r border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="24" height="16" rx="3" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
              <rect x="5" y="9" width="18" height="10" rx="1.5" fill="rgba(6,182,212,0.08)"/>
              <circle cx="9" cy="14" r="1.5" fill="#06B6D4"/>
              <circle cx="14" cy="14" r="1.5" fill="#7C3AED"/>
              <circle cx="19" cy="14" r="1.5" fill="#06B6D4"/>
            </svg>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-cyan-400">KAMIL</span>
              <span className="text-white"> OTP</span>
            </span>
          </Link>
        </div>

        {/* Balance card */}
        {user && (
          <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
            <p className="text-gray-500 text-xs mb-1">Saldo Kamu</p>
            <p className="text-xl font-bold text-cyan-400">{formatIDR(user.balance)}</p>
            <Link href="/topup" onClick={() => setOpen(false)} className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              <span>+ Top Up</span>
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + sign out */}
        {user && (
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="w-full btn-ghost text-sm text-left text-red-400 hover:text-red-300 hover:bg-red-500/5">
              🚪 Keluar
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
