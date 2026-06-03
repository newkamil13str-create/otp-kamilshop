'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'
import Link from 'next/link'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 h-16 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center px-4 lg:px-6">
      <div className="flex items-center justify-between w-full">
        <div className="pl-12 lg:pl-0">
          <p className="text-sm text-gray-500">
            Selamat datang, <span className="text-white font-medium">{user?.displayName ?? 'User'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Balance chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-cyan-400 font-mono text-sm font-semibold">
              {formatIDR(user?.balance ?? 0)}
            </span>
          </div>

          <Link href="/topup" className="btn-primary text-sm py-2 px-4">
            + Top Up
          </Link>
        </div>
      </div>
    </header>
  )
}
