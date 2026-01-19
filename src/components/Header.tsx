'use client'

import { motion } from 'framer-motion'
import { Sparkles, Trophy, Calendar, TrendingUp } from 'lucide-react'
import { BankrollWidget } from './bankroll'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-neon-green to-green-600 flex items-center justify-center"
              >
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-dark-900" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-neon-green rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-1.5 h-1.5 md:w-2 md:h-2 text-dark-900" />
              </motion.div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-xl font-bold text-white">
                La Passion<span className="text-neon-green"> VIP</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-white/50 -mt-0.5">Powered by Perplexity AI</p>
            </div>
            {/* Mobile-only short title */}
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-white">
                LP<span className="text-neon-green">VIP</span>
              </h1>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4"
          >
            {/* Date - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2 text-white/60">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>

            {/* Bankroll Widget */}
            <BankrollWidget />

            {/* AI Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green font-medium">IA Active</span>
            </div>
            {/* Mobile AI indicator */}
            <div className="md:hidden flex items-center justify-center w-8 h-8 bg-neon-green/10 border border-neon-green/30 rounded-full">
              <TrendingUp className="w-4 h-4 text-neon-green" />
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
