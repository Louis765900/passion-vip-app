'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-[100px] -translate-y-1/2" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Rejoignez-nous gratuitement
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Prêt à améliorer vos{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-300">
              analyses
            </span>{' '}
            ?
          </h2>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Rejoignez gratuitement notre communauté et accédez à des analyses détaillées 
            générées par IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className={cn(
                'inline-flex items-center justify-center gap-3',
                'px-10 py-5 rounded-xl',
                'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg',
                'hover:from-amber-400 hover:to-amber-500',
                'shadow-xl shadow-amber-500/25',
                'active:scale-[0.98]',
                'transition-all duration-200'
              )}
            >
              <Trophy className="w-6 h-6" />
              Créer mon compte gratuit
              <ArrowRight className="w-6 h-6" />
            </Link>

            <Link
              href="/soutenir"
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-8 py-5 rounded-xl',
                'bg-slate-800 text-white font-semibold text-lg',
                'border border-slate-700 hover:border-amber-500/50',
                'hover:bg-slate-700',
                'active:scale-[0.98]',
                'transition-all duration-200'
              )}
            >
              Soutenir le projet
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Gratuit pour toujours. Aucune carte bancaire requise.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
