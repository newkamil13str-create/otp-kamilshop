interface Props {
  className?: string
  lines?: number
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card-shimmer bg-white/[0.04] rounded-xl ${className}`} />
  )
}

export function SkeletonCard({ lines = 3 }: Props) {
  return (
    <div className="glass p-5 space-y-3 animate-pulse">
      <Skeleton className="h-5 w-1/3" />
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-3/4" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="px-5 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {[...Array(cols)].map((_, c) => (
                <Skeleton key={c} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
