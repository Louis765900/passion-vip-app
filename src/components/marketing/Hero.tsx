'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-amber-500/10 border border-amber-500/20',
            'text-amber-400 text-sm font-medium'
          )}>
            <Sparkles className="w-4 h-4" />
            100% Gratuit • 100% Transparent • Jeu Responsable
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Pronostics Football{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
            par IA
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-8"
        >
          Analyses basées sur les données, pas sur l&apos;intuition. 
          <span className="text-amber-400 font-semibold"> 57.9% de réussite</span>, 
          <span className="text-green-400 font-semibold"> +12.4% ROI</span>.
        </motion.p>

        {/* Stats mini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mb-10"
        >
          {[
            { value: '500+', label: 'Membres' },
            { value: '250+', label: 'Analyses' },
            { value: '24/7', label: 'Disponible' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/matchs"
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'px-8 py-4 rounded-xl',
              'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold',
              'hover:from-amber-400 hover:to-amber-500',
              'active:scale-[0.98]',
              'transition-all duration-200',
              'shadow-lg shadow-amber-500/25'
            )}
          >
            <Target className="w-5 h-5" />
            Voir les pronostics
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/pronostics"
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'px-8 py-4 rounded-xl',
              'bg-slate-800 text-white font-semibold border border-slate-700',
              'hover:bg-slate-700 hover:border-slate-600',
              'active:scale-[0.98]',
              'transition-all duration-200'
            )}
          >
            Voir le track record
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-xs text-slate-500 max-w-lg mx-auto"
        >
          * Les performances passées ne garantissent pas les résultats futurs. 
          PronoScope encourage le jeu responsable.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
          />
        </div>
      </motion.div>
    </section>
  );
}
