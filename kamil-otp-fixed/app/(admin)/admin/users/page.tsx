'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatIDR, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminUser {
  uid: string; email: string; displayName: string; balance: number
  totalTopup: number; totalSpent: number; role: string; createdAt: string
}

export default function AdminUsersPage() {
  const { firebaseUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')

  const getToken = () => firebaseUser!.getIdToken()

  const fetchUsers = async () => {
    const token = await getToken()
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { if (firebaseUser) fetchUsers() }, [firebaseUser])

  const doAction = async (action: string, value: string) => {
    if (!selected) return
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid: selected.uid, action, value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message)
      setSelected(null)
      setBalanceInput('')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500">{users.length} total user</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Cari email atau nama..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40"
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.02] animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">User</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Saldo</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Total Topup</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{u.displayName}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-cyan-400 font-medium">{formatIDR(u.balance)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{formatIDR(u.totalTopup)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-white/[0.06] text-gray-500'
                    }`}>
                      {u.role ?? 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setSelected(u); setBalanceInput('') }}
                      className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                    >
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-600">Tidak ada user</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Kelola User */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#111118] border border-white/[0.08] rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="font-bold text-white">{selected.displayName}</h3>
              <p className="text-xs text-gray-500">{selected.email}</p>
              <p className="text-sm text-cyan-400 mt-1 font-medium">Saldo: {formatIDR(selected.balance)}</p>
            </div>

            {/* Tambah/Set Saldo */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Jumlah (Rp)</label>
              <input
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="contoh: 50000"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => doAction('addBalance', balanceInput)}
                  disabled={actionLoading || !balanceInput}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30 disabled:opacity-40 transition-all"
                >
                  + Tambah Saldo
                </button>
                <button
                  onClick={() => doAction('setBalance', balanceInput)}
                  disabled={actionLoading || !balanceInput}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-yellow-600/20 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-600/30 disabled:opacity-40 transition-all"
                >
                  Set Saldo
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => doAction('setRole', selected.role === 'admin' ? 'user' : 'admin')}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30 disabled:opacity-40 transition-all"
              >
                {selected.role === 'admin' ? '👤 Set jadi User' : '🔐 Set jadi Admin'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-white bg-white/[0.04] transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
