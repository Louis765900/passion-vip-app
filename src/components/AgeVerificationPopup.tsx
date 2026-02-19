'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, AlertTriangle } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/utils/constants';

export function AgeVerificationPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user has verified age (stored for 1 year)
    const verifiedDate = localStorage.getItem(STORAGE_KEYS.ageVerifiedDate);
    
    if (verifiedDate) {
      const verified = new Date(verifiedDate);
      const now = new Date();
      const daysDiff = (now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24);
      
      // If verified less than 365 days ago, don't show popup
      if (daysDiff < 365) {
        return;
      }
    }
    
    setShowPopup(true);
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEYS.ageVerified, 'true');
    localStorage.setItem(STORAGE_KEYS.ageVerifiedDate, new Date().toISOString());
    setShowPopup(false);
  };

  const handleDeny = () => {
    // Redirect to responsible gambling page
    window.location.href = 'https://www.joueurs-info-service.fr/';
  };

  // Prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-slate-900/90 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-8 text-center border-b border-slate-700/50">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
              
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                  <ShieldAlert className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Vérification de l&apos;âge
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Ce site est réservé aux personnes majeures
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* 18+ Badge */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/30 mb-4">
                  <span className="text-4xl font-black text-red-400">18+</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  En accédant à ce site, vous confirmez avoir{' '}
                  <strong className="text-white">18 ans ou plus</strong> et acceptez que 
                  les informations fournies sont à titre informatif uniquement.
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-200/90 leading-relaxed">
                      Jouer comporte des risques : endettement, dépendance, isolement.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">
                        09 74 75 13 13
                      </span>
                      <span className="text-xs text-amber-400/70">(appel non surtaxé)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <motion.button
                  onClick={handleConfirm}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl text-base hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  J&apos;ai 18 ans ou plus - Entrer
                </motion.button>
                
                <button
                  onClick={handleDeny}
                  className="w-full py-4 text-slate-400 hover:text-white font-medium rounded-xl text-sm transition-colors border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                >
                  J&apos;ai moins de 18 ans - Quitter
                </button>
              </div>

              {/* Footer note */}
              <p className="text-center text-xs text-slate-500 mt-6">
                En cliquant sur &ldquo;Entrer&rdquo;, vous acceptez nos{' '}
                <a href="/cgu" className="text-amber-400 hover:underline">CGU</a> et{' '}
                <a href="/confidentialite" className="text-amber-400 hover:underline">Politique de confidentialité</a>.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
