'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Analyses Data-Driven',
    description: 'Nos algorithmes analysent des milliers de données pour vous donner le meilleur pronostic.',
    image: '/ticket1.jpg',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30',
  },
  {
    icon: Shield,
    title: '100% Transparent',
    description: 'Tous nos résultats sont publics et vérifiables. Pas de pronostic caché.',
    image: '/ticket2.jpg',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
  },
  {
    icon: Zap,
    title: 'Temps Réel',
    description: 'Recevez les pronostics instantanément avec les dernières données des matchs.',
    image: '/ticket3.jpg',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
  },
];

export function FeatureImages() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Une <span className="text-amber-400">expérience</span> unique
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Découvrez notre interface intuitive et nos analyses détaillées
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                <div className={`relative rounded-2xl overflow-hidden border ${feature.border} bg-gradient-to-br ${feature.color} p-1`}>
                  {/* Image */}
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
