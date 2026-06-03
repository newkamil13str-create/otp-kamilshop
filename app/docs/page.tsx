'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const SECTIONS = [
  { id: 'daftar', label: '📝 Cara Daftar & Login' },
  { id: 'topup', label: '💳 Cara Top Up Saldo' },
  { id: 'beli', label: '📱 Cara Beli Nomor OTP' },
  { id: 'sms', label: '📨 Cara Baca SMS/OTP' },
  { id: 'selesai', label: '✅ Selesaikan/Batalkan Order' },
  { id: 'layanan', label: '🔧 Layanan Populer' },
  { id: 'faq', label: '❓ FAQ' },
  { id: 'refund', label: '💸 Kebijakan Refund' },
]

export default function DocsPage() {
  const [active, setActive] = useState('daftar')

  return (
    <div className="animated-bg min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#0A0A0F]/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg"><span className="text-cyan-400">KAMIL</span><span className="text-white"> OTP</span></span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Masuk</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">Daftar</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 glass p-4 space-y-1">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-medium">Panduan</p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  active === s.id ? 'bg-cyan-500/15 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-2xl">
          {/* Mobile nav */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${active === s.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                {s.label}
              </button>
            ))}
          </div>

          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">

            {active === 'daftar' && <>
              <h1 className="text-2xl font-bold">📝 Cara Daftar & Login</h1>
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <div className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-cyan-500">
                  <h3 className="font-semibold text-white mb-2">1. Daftar via Email</h3>
                  <p>Kunjungi halaman <Link href="/register" className="text-cyan-400">/register</Link>, isi nama lengkap, email, dan password minimal 6 karakter. Klik "Daftar Sekarang", cek email untuk verifikasi.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-violet-500">
                  <h3 className="font-semibold text-white mb-2">2. Login via Google / GitHub</h3>
                  <p>Di halaman login, klik tombol Google atau GitHub. Izinkan akses, kamu akan langsung masuk ke dashboard.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-yellow-500">
                  <h3 className="font-semibold text-white mb-2">3. Lupa Password</h3>
                  <p>Klik "Lupa password?" di halaman login. Masukkan email, kami akan kirim link reset password.</p>
                </div>
              </div>
            </>}

            {active === 'topup' && <>
              <h1 className="text-2xl font-bold">💳 Cara Top Up Saldo</h1>
              <div className="space-y-4 text-gray-300 text-sm">
                <p>Saldo digunakan untuk membeli nomor OTP. Minimal top up <strong className="text-white">Rp 10.000</strong>.</p>
                <div className="space-y-3">
                  {['Buka menu "Top Up Saldo" di sidebar', 'Pilih nominal yang ingin diisi (10rb – 500rb) atau masukkan jumlah manual', 'Klik tombol "Bayar via QRIS"', 'Scan QR Code menggunakan aplikasi m-banking atau e-wallet (GoPay, OVO, Dana, dll)', 'Klik "Sudah Bayar" di aplikasi, saldo otomatis bertambah dalam hitungan detik'].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i+1}</span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {active === 'beli' && <>
              <h1 className="text-2xl font-bold">📱 Cara Beli Nomor OTP</h1>
              <div className="space-y-4 text-gray-300 text-sm">
                {['Buka menu "Beli Nomor" di sidebar', 'Pilih negara (contoh: Indonesia, Russia, Amerika)', 'Pilih layanan (Telegram, WhatsApp, Google, dll)', 'Cek harga dan saldo, klik "Beli Nomor"', 'Nomor telepon aktif dalam hitungan detik!'].map((step, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03]">
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i+1}</span>
                    <p>{step}</p>
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                  ⚠️ Pastikan saldo mencukupi sebelum beli. Jika SMS tidak datang dalam 20 menit, batalkan order untuk refund.
                </div>
              </div>
            </>}

            {active === 'sms' && <>
              <h1 className="text-2xl font-bold">📨 Cara Baca SMS / Kode OTP</h1>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>Setelah membeli nomor, kamu akan diarahkan ke halaman Order Detail.</p>
                <p>Halaman ini akan <strong className="text-cyan-400">otomatis refresh setiap 5 detik</strong> untuk mengecek SMS masuk.</p>
                <p>Kode OTP akan <span className="otp-highlight">disorot biru</span> secara otomatis agar mudah dilihat.</p>
                <p>Klik tombol "Salin OTP" untuk menyalin kode langsung ke clipboard.</p>
              </div>
            </>}

            {active === 'selesai' && <>
              <h1 className="text-2xl font-bold">✅ Selesaikan / Batalkan Order</h1>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Selesaikan Order</h3>
                  <p>Setelah menerima SMS OTP dan berhasil verifikasi, klik "Selesaikan" untuk menutup order.</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <h3 className="text-orange-400 font-semibold mb-2">❌ Batalkan Order</h3>
                  <p>Jika SMS tidak kunjung datang, batalkan order. Saldo akan dikembalikan penuh dalam hitungan detik.</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <h3 className="text-red-400 font-semibold mb-2">🚫 Ban Nomor</h3>
                  <p>Jika layanan menolak nomor (nomor terblokir/blacklist), klik Ban. Order akan dihapus dan nomor lain bisa dicoba.</p>
                </div>
              </div>
            </>}

            {active === 'layanan' && <>
              <h1 className="text-2xl font-bold">🔧 Layanan Populer</h1>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: '✈️', name: 'Telegram', desc: 'Aktivasi akun baru, login dua faktor' },
                  { icon: '💬', name: 'WhatsApp', desc: 'Daftar nomor baru, verifikasi' },
                  { icon: '🔍', name: 'Google', desc: 'Buat akun Gmail baru' },
                  { icon: '📘', name: 'Facebook', desc: 'Registrasi, verifikasi identitas' },
                  { icon: '📸', name: 'Instagram', desc: 'Buat akun baru atau verifikasi' },
                  { icon: '🎵', name: 'TikTok', desc: 'Daftar dengan nomor internasional' },
                  { icon: '🎮', name: 'Discord', desc: 'Verifikasi telepon akun' },
                  { icon: '🛒', name: 'Shopee', desc: 'Daftar akun seller/buyer' },
                ].map((s) => (
                  <div key={s.name} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{s.icon}</span>
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                    <p className="text-gray-600 text-xs">{s.desc}</p>
                  </div>
                ))}
              </div>
            </>}

            {active === 'faq' && <>
              <h1 className="text-2xl font-bold" id="faq">❓ FAQ</h1>
              <div className="space-y-4 text-sm">
                {[
                  { q: 'Kenapa SMS tidak datang?', a: 'Beberapa layanan memblokir nomor tertentu. Coba batalkan dan beli ulang, atau pilih operator yang berbeda.' },
                  { q: 'Berapa lama nomor aktif?', a: 'Nomor aktif selama 20 menit sejak pembelian. Setelah itu otomatis expired.' },
                  { q: 'Apakah saldo bisa refund jika SMS tidak datang?', a: 'Ya! Batalkan order sebelum 20 menit, saldo dikembalikan penuh.' },
                  { q: 'Bisakah nomor dipakai ulang?', a: 'Tidak. Setiap pembelian adalah nomor baru untuk satu sesi verifikasi.' },
                  { q: 'Apakah aman?', a: 'Data kamu dienkripsi. Kami tidak menyimpan SMS setelah order selesai.' },
                  { q: 'Metode pembayaran apa yang tersedia?', a: 'Saat ini hanya QRIS (GoPay, OVO, Dana, m-banking, dll).' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <h3 className="font-semibold text-white mb-2">Q: {item.q}</h3>
                    <p className="text-gray-400">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </>}

            {active === 'refund' && <>
              <h1 className="text-2xl font-bold" id="refund">💸 Kebijakan Refund</h1>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Refund Otomatis</h3>
                  <p>Batalkan order sebelum expired (20 menit), saldo dikembalikan <strong>penuh & instan</strong>.</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <h3 className="text-red-400 font-semibold mb-2">❌ Tidak Ada Refund</h3>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Order yang sudah FINISHED</li>
                    <li>• Order yang sudah EXPIRED tanpa dibatalkan</li>
                    <li>• Top up saldo (saldo tidak bisa ditarik)</li>
                  </ul>
                </div>
                <p className="text-gray-500 text-xs">Untuk pertanyaan lain, hubungi admin melalui Telegram.</p>
              </div>
            </>}

          </motion.div>
        </main>
      </div>
    </div>
  )
}
