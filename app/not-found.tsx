import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="animated-bg min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-white/[0.04] mb-4 select-none">404</div>
        <h1 className="text-3xl font-bold mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-8">Halaman yang kamu cari tidak ada atau telah dipindahkan.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">🏠 Ke Beranda</Link>
          <Link href="/dashboard" className="btn-secondary">📊 Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
