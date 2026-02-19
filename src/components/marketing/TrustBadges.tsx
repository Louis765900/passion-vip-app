'use client';

import { Shield, Zap, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const trustBadges = [
  {
    icon: Shield,
    title: '100% Gratuit',
    description: 'Aucun abonnement, aucune carte requise. Tout est gratuit.',
  },
  {
    icon: Zap,
    title: 'IA Avancée',
    description: 'Analyses basées sur les données et le machine learning.',
  },
  {
    icon: Heart,
    title: 'Jeu Responsable',
    description: 'Nous encourageons le jeu responsable avec des limites claires.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Rejoignez +500 parieurs qui nous font confiance.',
  },
];

export function TrustSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pourquoi nous <span className="text-amber-400">faire confiance</span> ?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Nous nous engageons à fournir les meilleures analyses possibles, 
            avec transparence et intégrité.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-6 rounded-2xl',
                'bg-slate-800/50 border border-slate-700/50',
                'hover:border-amber-500/30 hover:bg-slate-800/80',
                'transition-all duration-300 text-center'
              )}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <badge.icon className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{badge.title}</h3>
              <p className="text-sm text-slate-400">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
