'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Calendar } from 'lucide-react'
import { BankrollWidget } from './bankroll'
import Link from 'next/link'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header
      className={`sticky top-0 z-40 apple-header transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_0_rgba(255,255,255,0.05)]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-[52px]">

          {/* ── Logo ──────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5"
            >
              {/* Icon */}
              <div className="relative w-8 h-8 flex-shrink-0">
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.35)]">
                  <Zap className="w-4 h-4 text-black fill-black" />
                </div>
                {/* Live dot */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-apple-green rounded-full border-2 border-black"
                />
              </div>

              {/* Wordmark — desktop */}
              <div className="hidden sm:block">
                <span className="text-[15px] font-bold tracking-tight text-white">
                  Prono<span className="text-amber-400">Scope</span>
                </span>
              </div>

              {/* Wordmark — mobile */}
              <div className="sm:hidden">
                <span className="text-[14px] font-bold text-white">
                  P<span className="text-amber-400">S</span>
                </span>
              </div>
            </motion.div>
          </Link>

          {/* ── Right Side ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2"
          >
            {/* Date — large screen only */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/[0.05] border border-white/[0.07]">
              <Calendar className="w-3 h-3 text-white/40" />
              <span className="text-[12px] text-white/50">{today}</span>
            </div>

            {/* Bankroll Widget */}
            <BankrollWidget />

            {/* IA Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/[0.05] border border-white/[0.07]">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-apple-green flex-shrink-0"
              />
              <span className="hidden md:inline text-[12px] font-medium text-white/60">IA Active</span>
            </div>
          </motion.div>

        </div>
      </div>
    </header>
  )
}
