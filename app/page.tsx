'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const POPULAR_SERVICES = [
  { name: 'Telegram', icon: '✈️', priceFrom: 3500 },
  { name: 'WhatsApp', icon: '💬', priceFrom: 2500 },
  { name: 'Google', icon: '🔍', priceFrom: 4000 },
  { name: 'Facebook', icon: '📘', priceFrom: 2000 },
  { name: 'Instagram', icon: '📸', priceFrom: 3000 },
  { name: 'TikTok', icon: '🎵', priceFrom: 2500 },
  { name: 'Discord', icon: '🎮', priceFrom: 3000 },
  { name: 'Shopee', icon: '🛒', priceFrom: 2000 },
]

const FEATURES = [
  { icon: '🌍', title: '200+ Negara', desc: 'Pilih nomor dari ratusan negara di seluruh dunia' },
  { icon: '⚡', title: 'Instan & Cepat', desc: 'Nomor tersedia dalam hitungan detik setelah pembelian' },
  { icon: '📲', title: 'Bayar QRIS', desc: 'Pembayaran mudah via QRIS, tanpa kartu kredit' },
  { icon: '💰', title: 'Harga Terjangkau', desc: 'Mulai dari Rp 2.000 per nomor, hemat dan efisien' },
]

const STEPS = [
  { num: '01', title: 'Daftar Akun', desc: 'Buat akun gratis dalam 1 menit menggunakan email atau Google' },
  { num: '02', title: 'Top Up Saldo', desc: 'Isi saldo menggunakan QRIS, cepat dan aman' },
  { num: '03', title: 'Beli Nomor OTP', desc: 'Pilih layanan & negara, beli nomor, dan terima SMS OTP instan' },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="animated-bg min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#0A0A0F]/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="24" height="16" rx="3" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
              <rect x="5" y="9" width="18" height="10" rx="1.5" fill="rgba(6,182,212,0.1)"/>
              <circle cx="9" cy="14" r="1.5" fill="#06B6D4"/>
              <circle cx="14" cy="14" r="1.5" fill="#7C3AED"/>
              <circle cx="19" cy="14" r="1.5" fill="#06B6D4"/>
            </svg>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-cyan-400">KAMIL</span>
              <span className="text-white"> OTP</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/docs" className="btn-ghost text-sm hidden sm:block">Panduan</Link>
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Masuk</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {mounted && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-cyan-500/20 text-cyan-400 text-sm mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                200+ Negara · 500+ Layanan · Harga Terbaik
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-bold leading-tight mb-6"
              >
                Beli Nomor OTP Virtual{' '}
                <span className="gradient-text animate-gradient bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400">
                  Instan & Murah
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto"
              >
                Verifikasi akun Telegram, WhatsApp, Google & 500+ layanan lainnya. 
                Tanpa SIM card fisik. Bayar QRIS, nomor aktif dalam detik.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/register" className="btn-primary text-base px-8 py-4 inline-block">
                  🚀 Mulai Sekarang — Gratis
                </Link>
                <Link href="/docs" className="btn-secondary text-base px-8 py-4 inline-block">
                  📖 Cara Kerja
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-hover p-6"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Cara Pakai</h2>
            <p className="text-gray-500">Cukup 3 langkah mudah</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-6xl font-black text-white/[0.03]">
                  {step.num}
                </div>
                <div className="text-cyan-400 font-mono text-sm mb-3">{step.num}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Layanan Populer</h2>
            <p className="text-gray-500">Harga mulai dari Rp 2.000</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_SERVICES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass-hover p-5 text-center cursor-pointer"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-medium text-white mb-1">{s.name}</div>
                <div className="text-cyan-400 text-sm font-mono">
                  ab Rp {s.priceFrom.toLocaleString('id-ID')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                Siap Mulai?
              </h2>
              <p className="text-gray-400 mb-8">
                Daftar gratis sekarang dan dapatkan akses ke 200+ negara dan 500+ layanan
              </p>
              <Link href="/register" className="btn-primary text-base px-10 py-4 inline-block">
                Daftar Gratis Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">KAMIL</span>
              <span className="text-white font-bold">OTP</span>
              <span className="text-gray-600 text-sm ml-2">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/docs" className="hover:text-white transition-colors">Panduan</Link>
              <Link href="/docs#faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/docs#refund" className="hover:text-white transition-colors">Kebijakan Refund</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
