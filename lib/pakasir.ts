const PAKASIR_BASE = 'https://app.pakasir.com/api'
const PAKASIR_SLUG = process.env.PAKASIR_SLUG!
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY!

export async function createQrisTransaction(orderId: string, amount: number) {
  const res = await fetch(`${PAKASIR_BASE}/transactioncreate/qris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: PAKASIR_SLUG,
      order_id: orderId,
      amount,
      api_key: PAKASIR_API_KEY,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to create transaction')
  }
  return res.json()
}

export async function checkTransaction(orderId: string) {
  const res = await fetch(`${PAKASIR_BASE}/transactioncheck/${orderId}?api_key=${PAKASIR_API_KEY}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to check transaction')
  return res.json()
}
