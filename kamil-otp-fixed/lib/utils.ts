export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds} detik lalu`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return formatDate(date)
}

export function extractOTP(text: string): string | null {
  const match = text.match(/\b\d{4,8}\b/)
  return match ? match[0] : null
}

export function highlightOTP(text: string): string {
  return text.replace(/\b(\d{4,8})\b/g, '<mark class="otp-highlight">$1</mark>')
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'text-yellow-400 bg-yellow-400/10'
    case 'RECEIVED': return 'text-cyan-400 bg-cyan-400/10'
    case 'FINISHED': return 'text-green-400 bg-green-400/10'
    case 'CANCELED': return 'text-red-400 bg-red-400/10'
    case 'BANNED': return 'text-red-600 bg-red-600/10'
    case 'EXPIRED': return 'text-gray-400 bg-gray-400/10'
    case 'PAID': return 'text-green-400 bg-green-400/10'
    default: return 'text-gray-400 bg-gray-400/10'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING': return 'Menunggu SMS'
    case 'RECEIVED': return 'SMS Diterima'
    case 'FINISHED': return 'Selesai'
    case 'CANCELED': return 'Dibatalkan'
    case 'BANNED': return 'Diblokir'
    case 'EXPIRED': return 'Kedaluwarsa'
    case 'PAID': return 'Dibayar'
    default: return status
  }
}

export function getServiceIcon(service: string): string {
  const icons: Record<string, string> = {
    telegram: '✈️',
    whatsapp: '💬',
    google: '🔍',
    facebook: '📘',
    instagram: '📸',
    twitter: '🐦',
    tiktok: '🎵',
    discord: '🎮',
    shopee: '🛒',
    tokopedia: '🛍️',
    gojek: '🛵',
    grab: '🚗',
    default: '📱',
  }
  return icons[service.toLowerCase()] ?? icons.default
}

export function getRegion(iso: string): string {
  const regions: Record<string, string> = {
    ID: 'Asia Tenggara', MY: 'Asia Tenggara', TH: 'Asia Tenggara', VN: 'Asia Tenggara',
    PH: 'Asia Tenggara', SG: 'Asia Tenggara', MM: 'Asia Tenggara',
    RU: 'Eropa', US: 'Amerika', GB: 'Eropa', DE: 'Eropa', FR: 'Eropa',
    IN: 'Asia Selatan', CN: 'Asia Timur', JP: 'Asia Timur', KR: 'Asia Timur',
  }
  return regions[iso] ?? 'Lainnya'
}

export function rateLimit(map: Map<string, number[]>, key: string, maxReq: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = (map.get(key) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= maxReq) return false
  timestamps.push(now)
  map.set(key, timestamps)
  return true
}
