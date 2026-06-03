import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-guard'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// GET: list semua user
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req)

    const snap = await adminDb.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    const users = snap.docs.map((d) => {
      const data = d.data()
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? null,
        lastLogin: (data.lastLogin as Timestamp)?.toDate().toISOString() ?? null,
      }
    })

    return NextResponse.json(users)
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message.startsWith('Forbidden') ? 403 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}

// PATCH: update role atau tambah saldo
export async function PATCH(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const { uid, action, value } = await req.json()
    if (!uid || !action) return NextResponse.json({ error: 'uid & action required' }, { status: 400 })

    const userRef = adminDb.collection('users').doc(uid)
    const snap = await userRef.get()
    if (!snap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (action === 'setRole') {
      if (!['user', 'admin'].includes(value)) return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
      await userRef.update({ role: value })
      return NextResponse.json({ success: true, message: `Role diubah ke ${value}` })
    }

    if (action === 'addBalance') {
      const amount = parseInt(value)
      if (isNaN(amount) || amount <= 0) return NextResponse.json({ error: 'Amount tidak valid' }, { status: 400 })
      const data = snap.data()!
      await userRef.update({
        balance: (data.balance ?? 0) + amount,
        totalTopup: (data.totalTopup ?? 0) + amount,
      })
      return NextResponse.json({ success: true, message: `Saldo +Rp${amount.toLocaleString()} ditambahkan` })
    }

    if (action === 'setBalance') {
      const amount = parseInt(value)
      if (isNaN(amount) || amount < 0) return NextResponse.json({ error: 'Amount tidak valid' }, { status: 400 })
      await userRef.update({ balance: amount })
      return NextResponse.json({ success: true, message: `Saldo diset ke Rp${amount.toLocaleString()}` })
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message.startsWith('Forbidden') ? 403 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
