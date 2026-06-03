export type UserRole = 'user' | 'admin'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
  balance: number
  totalTopup: number
  totalSpent: number
  role: UserRole
  createdAt: Date
  lastLogin: Date
}

export type OrderStatus = 'PENDING' | 'RECEIVED' | 'FINISHED' | 'CANCELED' | 'BANNED' | 'EXPIRED'
export type TopupStatus = 'PENDING' | 'PAID' | 'EXPIRED'
export type PaymentMethod = 'qris'

export interface SMS {
  created_at: string
  date: string
  sender: string
  text: string
  code: string
}

export interface Order {
  orderId: string
  uid: string
  service: string
  country: string
  phone: string
  operator: string
  price: number
  priceRub: number
  status: OrderStatus
  sms: SMS[]
  createdAt: Date
  finishedAt?: Date
}

export interface Topup {
  topupId: string
  uid: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: TopupStatus
  qrisString: string
  expiredAt: Date
  createdAt: Date
  paidAt?: Date
}

export interface Country {
  iso: string
  name: string
  flag: string
  region: string
  prefix: string
}

export interface Service {
  name: string
  displayName: string
  icon: string
  priceRub: number
  priceIdr: number
  count: number
}

export interface Price {
  country: string
  operator: string
  product: string
  retail_price: number
  count: number
}

export interface RumahOTPOrder {
  id: string
  number: string
  operator: string
  service: string
  price: number
  status: number
  expires: string
  sms: SMS[]
  created_at: string
  country: string
}

export interface PakasirResponse {
  status: string
  message: string
  data: {
    order_id: string
    amount: number
    qris_string: string
    expired_at: string
  }
}

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface ApiKey {
  key: string
  uid: string
  name: string
  active: boolean
  createdAt: Date
  lastUsedAt?: Date
}
