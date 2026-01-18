'use client'

import { motion } from 'framer-motion'
import { Sparkles, Trophy, Calendar, TrendingUp } from 'lucide-react'
import { BankrollWidget } from './bankroll'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-green-600 flex items-center justify-center"
              >
                <Trophy className="w-5 h-5 text-dark-900" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-2 h-2 text-dark-900" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                La Passion<span className="text-neon-green"> VIP</span>
              </h1>
              <p className="text-[10px] text-white/50 -mt-0.5">Powered by Perplexity AI</p>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Date - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 text-white/60">
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green font-medium">IA Active</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
