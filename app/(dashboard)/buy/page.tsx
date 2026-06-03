'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR } from '@/lib/utils'

interface RService { id: string; name: string; displayName: string; icon: string | null }
interface RCountry {
  iso: string; name: string; flag: string; prefix: string; minPrice: number
  pricelist: { price: string; operator_id?: string; operator_name?: string }[]
}

function BuyContent() {
  const router = useRouter()
  const { user, firebaseUser, refreshUser } = useAuth()

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<RService[]>([])
  const [countries, setCountries] = useState<RCountry[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [selectedService, setSelectedService] = useState<RService | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<RCountry | null>(null)
  const [selectedPricelist, setSelectedPricelist] = useState<RCountry['pricelist'][0] | null>(null)
  const [serviceSearch, setServiceSearch] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [buying, setBuying] = useState(false)

  // Fetch semua services (aplikasi)
  useEffect(() => {
    fetch('/api/rumahotp/services')
      .then((r) => r.json())
      .then(setServices)
      .catch(() => toast.error('Gagal memuat layanan'))
      .finally(() => setLoadingServices(false))
  }, [])

  // Fetch negara berdasarkan service yang dipilih
  useEffect(() => {
    if (!selectedService) return
    setLoadingCountries(true)
    setSelectedCountry(null)
    setSelectedPricelist(null)
    setCountries([])
    fetch(`/api/rumahotp/countries?service_id=${selectedService.id}`)
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => toast.error('Gagal memuat negara'))
      .finally(() => setLoadingCountries(false))
  }, [selectedService])

  const handleSelectService = (svc: RService) => {
    setSelectedService(svc)
    setStep(2)
  }

  const handleSelectCountry = (c: RCountry) => {
    setSelectedCountry(c)
    // Otomatis pilih pricelist pertama (harga terendah)
    setSelectedPricelist(c.pricelist[0] ?? null)
    setStep(3)
  }

  const priceIdr = selectedPricelist ? Math.ceil(parseFloat(selectedPricelist.price) * (1 + 20 / 100)) : 0

  const handleBuy = async () => {
    if (!firebaseUser || !user || !selectedService || !selectedCountry || !selectedPricelist) return
    if (user.balance < priceIdr) {
      toast.error('Saldo tidak cukup. Silakan top up terlebih dahulu.')
      return
    }
    setBuying(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/rumahotp/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          country: selectedCountry.name,
          operatorId: selectedPricelist.operator_id ?? undefined,
          priceRaw: selectedPricelist.price,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membeli nomor')
      await refreshUser()
      toast.success('🎉 Nomor berhasil dibeli!')
      router.push(`/orders/${data.orderId}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBuying(false)
    }
  }

  const filteredServices = services.filter((s) =>
    (s.displayName ?? s.name ?? '').toLowerCase().includes(serviceSearch.toLowerCase())
  )
  const filteredCountries = countries.filter((c) =>
    (c.name ?? '').toLowerCase().includes(countrySearch.toLowerCase())
  )

  const STEPS = ['Pilih Aplikasi', 'Pilih Negara', 'Konfirmasi']

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Step Indicator */}
      <div className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((label, i) => {
          const done = step > i + 1
          const active = step === i + 1
          return (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                done ? 'bg-green-500/20 text-green-400' : active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-gray-600'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  done ? 'bg-green-500/30' : active ? 'bg-white/20' : 'bg-white/10'
                }`}>{done ? '✓' : i + 1}</span>
                <span className="hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`w-4 sm:w-6 h-px ${done ? 'bg-green-500/50' : 'bg-white/10'}`} />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Pilih Aplikasi/Service */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">📱 Pilih Aplikasi</h2>
          {selectedService && step > 1 && (
            <button onClick={() => { setStep(1); setSelectedService(null); setSelectedCountry(null); setSelectedPricelist(null) }}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Ubah</button>
          )}
        </div>
        {selectedService && step > 1 ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            {selectedService.icon
              ? <img src={selectedService.icon} alt="" className="w-8 h-8 rounded-lg object-contain" />
              : <span className="text-xl">📱</span>}
            <span className="font-medium text-cyan-400">{selectedService.displayName}</span>
          </div>
        ) : loadingServices ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl card-shimmer bg-white/[0.02]" />
            ))}
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredServices.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => handleSelectService(svc)}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all text-left"
                >
                  {svc.icon
                    ? <img src={svc.icon} alt="" className="w-7 h-7 rounded-lg object-contain flex-shrink-0" />
                    : <span className="text-lg flex-shrink-0">📱</span>}
                  <span className="text-sm font-medium truncate">{svc.displayName}</span>
                </button>
              ))}
              {filteredServices.length === 0 && (
                <p className="col-span-3 text-center text-sm text-gray-600 py-4">Tidak ditemukan</p>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Step 2: Pilih Negara */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div key="country" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">🌍 Pilih Negara</h2>
              {selectedCountry && step > 2 && (
                <button onClick={() => { setStep(2); setSelectedCountry(null); setSelectedPricelist(null) }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Ubah</button>
              )}
            </div>
            {selectedCountry && step > 2 ? (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-xl">{selectedCountry.flag}</span>
                <span className="font-medium text-cyan-400">{selectedCountry.name}</span>
                <span className="ml-auto text-sm text-gray-400">{formatIDR(priceIdr)}</span>
              </div>
            ) : loadingCountries ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl card-shimmer bg-white/[0.02]" />)}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Cari negara..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
                />
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.iso}
                      onClick={() => handleSelectCountry(c)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all text-left"
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="flex-1 text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.minPrice > 0 ? formatIDR(c.minPrice) : ''}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-center text-sm text-gray-600 py-4">Tidak ditemukan</p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Pilih Pricelist & Konfirmasi */}
      <AnimatePresence>
        {step >= 3 && selectedCountry && selectedPricelist && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Pilih Operator / Pricelist */}
            {selectedCountry.pricelist.length > 1 && (
              <div className="glass p-5">
                <h2 className="font-semibold mb-3 flex items-center gap-2">📡 Pilih Operator</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedCountry.pricelist.map((pl, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPricelist(pl)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedPricelist === pl
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white'
                      }`}
                    >
                      {pl.operator_name ?? `Operator ${i + 1}`} — {formatIDR(Math.ceil(parseFloat(pl.price) * 1.2))}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Konfirmasi */}
            <div className="glass p-5 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">✅ Konfirmasi Pembelian</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Aplikasi</span>
                  <span className="font-medium">{selectedService?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Negara</span>
                  <span className="font-medium">{selectedCountry.flag} {selectedCountry.name}</span>
                </div>
                {selectedPricelist.operator_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Operator</span>
                    <span className="font-medium">{selectedPricelist.operator_name}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2">
                  <span className="text-gray-400">Harga</span>
                  <span className="font-bold text-cyan-400">{formatIDR(priceIdr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Saldo kamu</span>
                  <span className={`font-medium ${(user?.balance ?? 0) >= priceIdr ? 'text-green-400' : 'text-red-400'}`}>
                    {formatIDR(user?.balance ?? 0)}
                  </span>
                </div>
              </div>

              {(user?.balance ?? 0) < priceIdr && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  ⚠️ Saldo tidak cukup. Silakan top up terlebih dahulu.
                </p>
              )}

              <button
                onClick={handleBuy}
                disabled={buying || (user?.balance ?? 0) < priceIdr}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {buying ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                ) : '🛒 Beli Nomor Sekarang'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <BuyContent />
    </Suspense>
  )
}
