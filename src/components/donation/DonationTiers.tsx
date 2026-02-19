'use client';

import { useState } from 'react';
import { Coffee, Star, Crown, Trophy, Check } from 'lucide-react';
import { DONATION_TIERS, DonationTier } from '@/lib/types/donation';
import { cn } from '@/lib/utils/cn';

interface DonationTiersProps {
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
}

const tierIcons: Record<DonationTier, React.ElementType> = {
  COFFEE: Coffee,
  SUPPORTER: Star,
  FAN: Star,
  VIP: Crown,
  LEGEND: Trophy,
};

export function DonationTiers({ selectedAmount, onSelectAmount }: DonationTiersProps) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {(Object.keys(DONATION_TIERS) as DonationTier[]).map((tierKey) => {
        const tier = DONATION_TIERS[tierKey];
        const Icon = tierIcons[tierKey];
        const isSelected = selectedAmount === tier.minAmount;
        const isHovered = hoveredTier === tierKey;

        return (
          <button
            key={tierKey}
            onClick={() => onSelectAmount(tier.minAmount)}
            onMouseEnter={() => setHoveredTier(tierKey)}
            onMouseLeave={() => setHoveredTier(null)}
            className={cn(
              'relative p-6 rounded-2xl border-2 transition-all duration-300 text-left',
              'hover:scale-105 hover:-translate-y-1',
              isSelected
                ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/50'
            )}
          >
            {/* Popular badge */}
            {tierKey === 'VIP' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                  POPULAIRE
                </span>
              </div>
            )}

            {/* Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                isSelected ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'
              )}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <h3 className="font-bold text-white mb-1">{tier.name}</h3>
            <p className="text-2xl font-bold text-amber-400 mb-2">
              {tier.minAmount}€
            </p>
            <p className="text-xs text-slate-400 mb-4">{tier.duration}</p>

            {/* Benefits */}
            <ul className="space-y-2">
              {tier.benefits.slice(0, 2).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Emoji decoration */}
            <div className="absolute top-4 right-4 text-2xl opacity-20">
              {tier.emoji}
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute bottom-4 right-4">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
