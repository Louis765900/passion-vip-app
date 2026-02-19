'use client';

import { motion } from 'framer-motion';
import { BarChart3, Eye, Zap, Brain, Database, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const steps = [
  {
    icon: Database,
    title: 'Collecte des Données',
    description: 'Notre IA récupère en temps réel les statistiques des équipes, les formes récentes, les confrontations directes et les actualités.',
    color: 'blue',
  },
  {
    icon: Brain,
    title: 'Analyse IA',
    description: 'Les données sont analysées par nos algorithmes de machine learning pour identifier les patterns et tendances.',
    color: 'purple',
  },
  {
    icon: Eye,
    title: 'Contextualisation',
    description: 'Nous prenons en compte les facteurs humains : blessures, suspensions, météo, enjeux du match.',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'Value Betting',
    description: 'Identification des cotes surcotées avec calcul de l\'Expected Value (EV) pour maximiser vos gains.',
    color: 'green',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
          >
            <Zap className="w-4 h-4" />
            Notre Méthodologie
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Comment fonctionne notre <span className="text-blue-400">IA</span> ?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Une approche rigoureuse basée sur les données, pas sur l&apos;intuition.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative p-6 rounded-2xl',
                  'bg-slate-800/50 border border-slate-700/50',
                  'hover:border-blue-500/30',
                  'transition-all duration-300 group'
                )}
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                    'bg-blue-500/10 group-hover:bg-blue-500/20',
                    'transition-colors'
                  )}
                >
                  <Icon className="w-7 h-7 text-blue-400" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
