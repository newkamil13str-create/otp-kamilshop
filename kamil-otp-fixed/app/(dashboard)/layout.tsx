'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !firebaseUser) router.push('/login')
  }, [firebaseUser, loading, router])

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!firebaseUser) return null

  return (
    <div className="animated-bg min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  )
}
