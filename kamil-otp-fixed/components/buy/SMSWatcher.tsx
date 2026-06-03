'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Order } from '@/types'

interface Props {
  orderId: string
  currentStatus: string
  onUpdate: (order: Order) => void
}

const ACTIVE_STATUSES = ['PENDING', 'RECEIVED']

export default function SMSWatcher({ orderId, currentStatus, onUpdate }: Props) {
  const { firebaseUser } = useAuth()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isActive = ACTIVE_STATUSES.includes(currentStatus)

  const poll = useCallback(async () => {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/5sim/sms?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.order) onUpdate(data.order)
      }
    } catch {
      // silent fail — UI still shows last known state
    }
  }, [firebaseUser, orderId, onUpdate])

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    // Immediate first poll
    poll()
    timerRef.current = setInterval(poll, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, poll])

  if (!isActive) return null

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
      </span>
      Memantau SMS secara otomatis setiap 5 detik…
    </div>
  )
}
