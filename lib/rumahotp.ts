const BASE_URL = 'https://www.rumahotp.io/api'
const API_KEY = process.env.RUMAHOTP_API_KEY!
const MARKUP = parseFloat(process.env.RUMAHOTP_MARKUP_PERCENT ?? '20')

const headers = {
  'x-apikey': API_KEY,
  'accept': 'application/json',
}

// Harga dari RumahOTP sudah IDR, tinggal tambah markup
export function applyMarkup(priceIdr: number): number {
  return Math.ceil(priceIdr * (1 + MARKUP / 100))
}

// Balance akun
export async function getBalance() {
  const res = await fetch(`${BASE_URL}/v1/user/balance`, { headers, cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch balance')
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to fetch balance')
  return json.data
}

// Daftar aplikasi/layanan
export async function getServices() {
  const res = await fetch(`${BASE_URL}/v2/services`, { headers, next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch services')
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to fetch services')
  return json.data // array of services
}

// Daftar negara dengan pricelist
export async function getCountries(serviceId?: string) {
  const params = new URLSearchParams()
  if (serviceId) params.set('service_id', serviceId)
  const url = `${BASE_URL}/v2/countries${serviceId ? `?${params}` : ''}`
  const res = await fetch(url, { headers, next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch countries')
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to fetch countries')
  return json.data
}

// Daftar operator seluler
export async function getOperators(country: string, providerId: string) {
  const params = new URLSearchParams({ country, provider_id: providerId })
  const res = await fetch(`${BASE_URL}/v2/operators?${params}`, { headers, next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Failed to fetch operators')
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to fetch operators')
  return json.data
}

// Pesan nomor OTP
export async function buyNumber(serviceId: string, country: string, operatorId?: string) {
  const params = new URLSearchParams({
    service_id: serviceId,
    country,
    ...(operatorId ? { operator_id: operatorId } : {}),
  })
  const res = await fetch(`${BASE_URL}/v2/orders?${params}`, { headers, cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to buy number')
  }
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to buy number')
  return json.data
}

// Cek status pesanan
export async function checkOrder(orderId: string) {
  const params = new URLSearchParams({ order_id: orderId })
  const res = await fetch(`${BASE_URL}/v1/orders/get_status?${params}`, { headers, cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to check order')
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to check order')
  return json.data
}

// Set status pesanan (finish / cancel / ban)
export async function setOrderStatus(orderId: string, status: 'finish' | 'cancel' | 'ban') {
  const STATUS_MAP = { finish: 8, cancel: 6, ban: 9 } // kode status RumahOTP
  const params = new URLSearchParams({
    order_id: orderId,
    status: String(STATUS_MAP[status]),
  })
  const res = await fetch(`${BASE_URL}/v1/orders/set_status?${params}`, { headers, cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to set order status')
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'Failed to set order status')
  return json.data
}
