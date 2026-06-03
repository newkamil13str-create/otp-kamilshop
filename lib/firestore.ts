import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { User, Order, Topup } from '@/types'

// ─── USER ───────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as User
}

export async function createUser(uid: string, data: Partial<User>) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    photoURL: data.photoURL ?? '',
    balance: 0,
    totalTopup: 0,
    totalSpent: 0,
    role: 'user',
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  })
}

export async function updateUserBalance(uid: string, amount: number) {
  await updateDoc(doc(db, 'users', uid), {
    balance: amount,
  })
}

export async function updateLastLogin(uid: string) {
  await updateDoc(doc(db, 'users', uid), {
    lastLogin: serverTimestamp(),
  })
}

// ─── ORDERS ─────────────────────────────────────────────────────────────────

export async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', orderId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    finishedAt: data.finishedAt ? (data.finishedAt as Timestamp).toDate() : undefined,
  } as Order
}

export async function createOrder(order: Omit<Order, 'createdAt' | 'finishedAt'>) {
  await setDoc(doc(db, 'orders', order.orderId), {
    ...order,
    createdAt: serverTimestamp(),
    finishedAt: null,
  })
}

export async function updateOrder(orderId: string, data: Partial<Order>) {
  await updateDoc(doc(db, 'orders', orderId), {
    ...data,
    ...(data.finishedAt ? { finishedAt: serverTimestamp() } : {}),
  })
}

export async function getUserOrders(uid: string, limitCount = 20): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      finishedAt: data.finishedAt ? (data.finishedAt as Timestamp).toDate() : undefined,
    } as Order
  })
}

// ─── TOPUPS ─────────────────────────────────────────────────────────────────

export async function createTopup(topup: Omit<Topup, 'createdAt' | 'paidAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'topups'), {
    ...topup,
    createdAt: serverTimestamp(),
    paidAt: null,
  })
  return ref.id
}

export async function getTopup(topupId: string): Promise<Topup | null> {
  const snap = await getDoc(doc(db, 'topups', topupId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    topupId: snap.id,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    expiredAt: (data.expiredAt as Timestamp)?.toDate(),
    paidAt: data.paidAt ? (data.paidAt as Timestamp).toDate() : undefined,
  } as Topup
}

export async function updateTopup(topupId: string, data: Partial<Topup>) {
  await updateDoc(doc(db, 'topups', topupId), data)
}

export async function getTopupByOrderId(orderId: string): Promise<Topup | null> {
  const q = query(collection(db, 'topups'), where('orderId', '==', orderId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0].data()
  return {
    ...d,
    topupId: snap.docs[0].id,
    createdAt: (d.createdAt as Timestamp)?.toDate(),
    expiredAt: (d.expiredAt as Timestamp)?.toDate(),
    paidAt: d.paidAt ? (d.paidAt as Timestamp).toDate() : undefined,
  } as Topup
}

export async function getUserTopups(uid: string, limitCount = 10): Promise<Topup[]> {
  const q = query(
    collection(db, 'topups'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      topupId: d.id,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      expiredAt: (data.expiredAt as Timestamp)?.toDate(),
      paidAt: data.paidAt ? (data.paidAt as Timestamp).toDate() : undefined,
    } as Topup
  })
}

// ─── ATOMIC OPERATIONS ──────────────────────────────────────────────────────

export async function deductBalanceAndCreateOrder(
  uid: string,
  price: number,
  order: Omit<Order, 'createdAt' | 'finishedAt'>
) {
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', uid)
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists()) throw new Error('User not found')
    const userData = userSnap.data() as User
    if (userData.balance < price) throw new Error('Insufficient balance')
    tx.update(userRef, {
      balance: userData.balance - price,
      totalSpent: (userData.totalSpent ?? 0) + price,
    })
    tx.set(doc(db, 'orders', order.orderId), {
      ...order,
      createdAt: serverTimestamp(),
      finishedAt: null,
    })
  })
}

export async function addBalanceAndUpdateTopup(uid: string, amount: number, topupId: string, orderId: string) {
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', uid)
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists()) throw new Error('User not found')
    const userData = userSnap.data() as User
    tx.update(userRef, {
      balance: userData.balance + amount,
      totalTopup: (userData.totalTopup ?? 0) + amount,
    })
    const q = query(collection(db, 'topups'), where('orderId', '==', orderId))
    const snap = await getDocs(q)
    if (!snap.empty) {
      tx.update(doc(db, 'topups', snap.docs[0].id), {
        status: 'PAID',
        paidAt: serverTimestamp(),
      })
    }
  })
}

// ─── ADMIN ──────────────────────────────────────────────────────────────────

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return false
  return snap.data().role === 'admin'
}

export async function getAllUsers(limitCount = 50): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      lastLogin: (data.lastLogin as Timestamp)?.toDate(),
    } as User
  })
}

export async function setUserRole(uid: string, role: 'user' | 'admin') {
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function adminAddBalance(uid: string, amount: number) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('User not found')
    const data = snap.data() as User
    tx.update(ref, {
      balance: (data.balance ?? 0) + amount,
      totalTopup: (data.totalTopup ?? 0) + amount,
    })
  })
}

export async function getAllOrders(limitCount = 100): Promise<Order[]> {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      finishedAt: data.finishedAt ? (data.finishedAt as Timestamp).toDate() : undefined,
    } as Order
  })
}

export async function getAllTopups(limitCount = 100): Promise<Topup[]> {
  const q = query(collection(db, 'topups'), orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      topupId: d.id,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      expiredAt: (data.expiredAt as Timestamp)?.toDate(),
      paidAt: data.paidAt ? (data.paidAt as Timestamp).toDate() : undefined,
    } as Topup
  })
}

export async function getAdminStats() {
  const [usersSnap, ordersSnap, topupsSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), limit(1000))),
    getDocs(query(collection(db, 'orders'), limit(1000))),
    getDocs(query(collection(db, 'topups'), where('status', '==', 'PAID'), limit(1000))),
  ])

  const totalRevenue = topupsSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0)
  const totalOrders = ordersSnap.size
  const totalUsers = usersSnap.size

  return { totalUsers, totalOrders, totalRevenue }
}
