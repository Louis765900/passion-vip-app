'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function HeroImages() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 mb-8">
      {/* Main screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-slate-700/50">
          <Image
            src="/screenshot-desktop.png"
            alt="Interface PronoScope"
            width={1200}
            height={675}
            className="w-full h-auto"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      </motion.div>

      {/* Floating cards */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute -left-4 md:-left-12 top-1/4 z-20 hidden md:block"
      >
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">PSG vs Monaco</p>
              <p className="text-green-400 text-xs">Gagné @ 1.75</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute -right-4 md:-right-12 top-1/2 z-20 hidden md:block"
      >
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-lg">🎯</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Analyse IA</p>
              <p className="text-amber-400 text-xs">Confiance: 78%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 blur-3xl -z-10" />
    </div>
  );
}
