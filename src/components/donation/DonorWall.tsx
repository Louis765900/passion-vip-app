'use client';

import { useEffect, useState } from 'react';
import { Trophy, Crown, Star, Coffee, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { DonorDisplay, DonationTier, DONATION_TIERS } from '@/lib/types/donation';
import { cn } from '@/lib/utils/cn';

const tierIcons: Record<DonationTier, React.ElementType> = {
  COFFEE: Coffee,
  SUPPORTER: Star,
  FAN: Star,
  VIP: Crown,
  LEGEND: Trophy,
};

const tierGradients: Record<DonationTier, string> = {
  COFFEE: 'from-amber-700 to-amber-800',
  SUPPORTER: 'from-amber-600 to-amber-700',
  FAN: 'from-violet-500 to-violet-600',
  VIP: 'from-amber-500 to-amber-600',
  LEGEND: 'from-yellow-400 via-amber-500 to-yellow-600',
};

interface DonorWallProps {
  limit?: number;
  showRecent?: boolean;
}

export function DonorWall({ limit = 10, showRecent = true }: DonorWallProps) {
  const [donors, setDonors] = useState<DonorDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch donors from API
    fetch('/api/donations/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDonors(data.donors.slice(0, limit));
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [limit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-slate-800/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">
          Soyez le premier à soutenir le projet !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showRecent && (
        <p className="text-sm text-slate-400 text-center">
          {donors.length} contributeur{donors.length > 1 ? 's' : ''} nous ont déjà soutenu
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {donors.map((donor, index) => {
          const Icon = tierIcons[donor.tier];
          const tier = DONATION_TIERS[donor.tier];

          return (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative p-4 rounded-xl border text-center',
                'bg-gradient-to-br border-white/10',
                'hover:scale-105 transition-transform cursor-pointer group',
                tierGradients[donor.tier]
              )}
            >
              {/* Icon */}
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Name */}
              <p className="font-semibold text-white text-sm truncate">
                {donor.isAnonymous ? 'Anonyme' : donor.name}
              </p>

              {/* Amount */}
              <p className="text-white/80 text-xs">
                {donor.totalDonated}€
              </p>

              {/* Badge */}
              <div className="absolute -top-2 -right-2 text-lg" title={tier.name}>
                {tier.emoji}
              </div>

              {/* Message tooltip */}
              {donor.message && (
                <div className="absolute inset-0 bg-black/90 rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-xs text-white line-clamp-3">&ldquo;{donor.message}&rdquo;</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
