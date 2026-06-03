'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
        <p className="text-gray-400 text-sm mb-6">
          {error.message ?? 'Sesuatu berjalan tidak semestinya. Tim kami sudah diberitahu.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            🔄 Coba Lagi
          </button>
          <Link href="/dashboard" className="btn-secondary">
            🏠 Ke Dashboard
          </Link>
        </div>
        {error.digest && (
          <p className="text-gray-700 text-xs mt-4 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
