'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const testimonials = [
  {
    name: 'Thomas M.',
    role: 'Parieur depuis 6 mois',
    content: 'Les analyses sont vraiment pertinentes. Le taux de réussite est impressionnant et surtout, c\'est 100% gratuit !',
    rating: 5,
  },
  {
    name: 'Sophie L.',
    role: 'Membre VIP',
    content: 'J\'ai enfin trouvé une plateforme transparente qui ne cherche pas à me vendre des abonnements. Le système de bankroll m\'a beaucoup aidée.',
    rating: 5,
  },
  {
    name: 'Alexandre D.',
    role: 'Parieur expérimenté',
    content: 'L\'approche basée sur les données et l\'IA est rafraîchissante. Fini les pronostics au hasard, ici c\'est du sérieux.',
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ce que disent nos <span className="text-amber-400">membres</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Rejoignez des centaines de parieurs satisfaits qui utilisent nos analyses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative p-6 rounded-2xl',
                'bg-slate-800/50 border border-slate-700/50',
                'hover:border-amber-500/20',
                'transition-all duration-300'
              )}
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-700" />

              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>

              {/* Content */}
              <p className="text-slate-300 mb-6 relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
