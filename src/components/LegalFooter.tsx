'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, ExternalLink, ChevronUp, Shield, Info } from 'lucide-react';
import Link from 'next/link';

export function LegalFooter() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="bg-gray-950 border-t border-white/10 mt-auto">
      {/* Bandeau d'avertissement principal - Toujours visible */}
      <div className="bg-gradient-to-r from-amber-900/30 via-red-900/30 to-amber-900/30 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">18+</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              <strong>Jouer comporte des risques :</strong> endettement, isolement, dependance.
            </p>
            <a
              href="tel:0974751313"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-full text-amber-300 text-xs font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>09 74 75 13 13</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contenu du footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-safe">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Logo et description */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-green-600 flex items-center justify-center">
                <span className="text-black font-bold text-sm">PS</span>
              </div>
              <span className="text-white font-bold">Prono<span className="text-neon-green">Scope</span></span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Analyses et pronostics sportifs a titre informatif uniquement.
              Ne constitue pas un conseil financier.
            </p>
          </div>

          {/* Liens utiles */}
          <div className="text-center">
            <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
              Informations
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-xs text-white/50 hover:text-white transition-colors">
                  Mentions legales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-xs text-white/50 hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-xs text-white/50 hover:text-white transition-colors">
                  Politique de confidentialite
                </Link>
              </li>
              <li>
                <Link href="/jeu-responsable" className="text-xs text-white/50 hover:text-white transition-colors">
                  Jeu responsable
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources d'aide */}
          <div className="text-center md:text-right">
            <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
              Aide et assistance
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.joueurs-info-service.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
                >
                  Joueurs Info Service
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.addictaide.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
                >
                  Addict'Aide
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="tel:0974751313"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  <Phone className="w-3 h-3" />
                  09 74 75 13 13 (appel non surtaxe)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bouton pour afficher plus */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-white/40 hover:text-white/60 transition-colors"
        >
          <span className="text-xs">
            {isExpanded ? 'Masquer les informations legales' : 'Voir les informations legales'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-4 h-4" />
          </motion.div>
        </button>

        {/* Section expandable - Informations legales detaillees */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
                {/* Avertissement detaille */}
                <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-xs text-white/70 leading-relaxed">
                      <p>
                        <strong className="text-red-400">AVERTISSEMENT :</strong> Les jeux d'argent et de hasard peuvent etre dangereux : endettement, dependance, isolement.
                      </p>
                      <p>
                        Les pronostics fournis sont a titre indicatif uniquement et ne garantissent aucun resultat.
                        Les performances passees ne prejugent pas des performances futures.
                      </p>
                      <p>
                        <strong>Ne pariez jamais plus que ce que vous pouvez vous permettre de perdre.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations sur le jeu responsable */}
                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-xs text-white/70 leading-relaxed">
                      <p className="font-medium text-blue-300">Conseils pour un jeu responsable :</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Fixez-vous des limites de temps et d'argent avant de jouer</li>
                        <li>Ne jouez jamais pour recuperer vos pertes</li>
                        <li>Le jeu ne doit pas etre une source de revenus</li>
                        <li>Faites des pauses regulieres</li>
                        <li>En cas de doute, faites-vous aider</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Badge 18+ et partenaires */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
                    <span className="text-red-400 font-bold text-sm">18+</span>
                    <span className="text-xs text-white/50">Interdit aux mineurs</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">Jeu responsable</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30">
            © {new Date().getFullYear()} PronoScope. Tous droits reserves.
            Les pronostics sont fournis a titre informatif. Ce site n'est pas un operateur de jeux agree.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LegalFooter;
