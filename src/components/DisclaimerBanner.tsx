'use client';

import { AlertTriangle, Phone } from 'lucide-react';

interface DisclaimerBannerProps {
  variant?: 'default' | 'compact';
}

export function DisclaimerBanner({ variant = 'default' }: DisclaimerBannerProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-amber-500/10 border-l-4 border-amber-500 px-4 py-3">
        <p className="text-sm text-amber-200">
          <span className="font-bold">18+</span> | Jouer comporte des risques |
          <a href="tel:0974751313" className="ml-1 underline">09 74 75 13 13</a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-900/30 via-red-900/20 to-amber-900/30 border-y border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-100">
                <span className="font-bold">Avertissement :</span> Les pronostics sont fournis a titre purement informatif
                et ne constituent pas une incitation aux jeux d'argent.
              </p>
              <p className="text-xs text-amber-200/70 mt-1">
                Jouer comporte des risques : endettement, isolement, dependance.
                <span className="font-bold text-amber-300 ml-1">18+ uniquement.</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <Phone className="w-4 h-4 text-red-400" />
            <div className="text-sm">
              <span className="text-gray-400">Aide : </span>
              <a href="tel:0974751313" className="text-red-300 font-bold hover:underline">
                09 74 75 13 13
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerBanner;
