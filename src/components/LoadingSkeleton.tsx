'use client'

import { motion } from 'framer-motion'

export function MatchCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        <div className="skeleton-shimmer h-4 w-16 rounded" />
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-12 w-12 rounded-full" />
          <div className="skeleton-shimmer h-5 w-28 rounded" />
        </div>

        <div className="skeleton-shimmer h-6 w-10 rounded" />

        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-5 w-28 rounded" />
          <div className="skeleton-shimmer h-12 w-12 rounded-full" />
        </div>
      </div>

      <div className="skeleton-shimmer h-10 w-full rounded-lg" />
    </div>
  )
}

export function PronosticSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-6"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full"
        />
        <div>
          <div className="skeleton-shimmer h-5 w-48 rounded mb-2" />
          <div className="skeleton-shimmer h-3 w-32 rounded" />
        </div>
      </div>

      {/* Probabilités skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center space-y-2">
            <div className="skeleton-shimmer h-16 w-16 rounded-full mx-auto" />
            <div className="skeleton-shimmer h-4 w-12 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Score prédit skeleton */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="skeleton-shimmer h-12 w-24 rounded-lg" />
        <div className="skeleton-shimmer h-8 w-8 rounded" />
        <div className="skeleton-shimmer h-12 w-24 rounded-lg" />
      </div>

      {/* Analyse skeleton */}
      <div className="space-y-3">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        <div className="skeleton-shimmer h-4 w-4/6 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-shimmer h-20 w-full rounded-lg" />
        ))}
      </div>
    </motion.div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <div className="skeleton-shimmer h-6 w-40 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((card) => (
              <MatchCardSkeleton key={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
