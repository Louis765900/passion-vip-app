'use client';

import { motion } from 'framer-motion';
import { Scale, Building2, Globe, Mail, Phone, ArrowLeft, Shield, Server } from 'lucide-react';
import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'accueil
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Mentions Legales</h1>
          </div>
          <p className="text-gray-400">
            Derniere mise a jour : 29 janvier 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Editeur du site */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">1. Editeur du site</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p><strong className="text-white">Nom du site :</strong> PronoScope</p>
              <p><strong className="text-white">Nature :</strong> Site informatif gratuit - Analyses sportives generees par IA</p>
              <p><strong className="text-white">Statut :</strong> Projet personnel non commercial</p>
              <p><strong className="text-white">Responsable de la publication :</strong> Louis</p>
              <p><strong className="text-white">Contact :</strong> contact@lapassion-vip.fr</p>
            </div>
          </section>

          {/* Hebergement */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">2. Hebergement</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p><strong className="text-white">Hebergeur :</strong> Vercel Inc.</p>
              <p><strong className="text-white">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong className="text-white">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">https://vercel.com</a></p>
            </div>
          </section>

          {/* Nature du site */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">3. Nature du site et activite</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm">
              <p>
                Ce site est un <strong className="text-white">site informatif entierement gratuit</strong> qui propose des analyses sportives
                generees par intelligence artificielle a titre indicatif.
              </p>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-300 font-medium">
                  Important : Ce site ne vend aucun pronostic. L'acces a l'ensemble du contenu est 100% gratuit.
                </p>
              </div>
              <p>
                <strong className="text-white">Ce site n'est PAS :</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Un operateur de jeux d'argent agree par l'ANJ</li>
                <li>Une plateforme de paris en ligne</li>
                <li>Un service de vente de pronostics</li>
                <li>Un conseiller financier ou en investissement</li>
              </ul>
              <p>
                <strong className="text-white">Ce site EST :</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Un site informatif a but educatif</li>
                <li>Un outil d'analyse statistique base sur l'IA</li>
                <li>Une ressource gratuite pour les passionnes de sport</li>
              </ul>
            </div>
          </section>

          {/* Propriete intellectuelle */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">4. Propriete intellectuelle</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                L'ensemble des elements presents sur ce site (textes, graphismes, logos, images, analyses)
                sont proteges par le droit de la propriete intellectuelle.
              </p>
              <p>
                Toute reproduction, representation, modification ou exploitation non autorisee
                de tout ou partie du contenu du site est interdite.
              </p>
              <p>
                Les logos des clubs, ligues et competitions sportives mentionnes sur ce site
                appartiennent a leurs proprietaires respectifs.
              </p>
            </div>
          </section>

          {/* Responsabilite */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">5. Limitation de responsabilite</h2>
            <div className="space-y-4 text-gray-300 text-sm">
              <p>
                Les informations diffusees sur ce site sont fournies <strong className="text-white">a titre purement indicatif</strong> et
                ne sauraient constituer des conseils en matiere de paris sportifs ou d'investissement.
              </p>
              <p>
                L'editeur ne peut etre tenu responsable des eventuelles pertes financieres
                resultant de l'utilisation des informations presentees sur ce site.
              </p>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-300">
                  <strong>Avertissement :</strong> Les performances passees ne garantissent pas les resultats futurs.
                  Les analyses IA sont des outils d'aide a la decision et non des certitudes.
                </p>
              </div>
            </div>
          </section>

          {/* Donnees personnelles */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">6. Donnees personnelles</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Conformement au Reglement General sur la Protection des Donnees (RGPD),
                vous disposez de droits concernant vos donnees personnelles.
              </p>
              <p>
                Pour plus d'informations, consultez notre{' '}
                <Link href="/confidentialite" className="text-amber-400 hover:underline">
                  Politique de Confidentialite
                </Link>.
              </p>
            </div>
          </section>

          {/* Loi applicable */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">7. Loi applicable</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Les presentes mentions legales sont regies par le droit francais.
                En cas de litige, les tribunaux francais seront seuls competents.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">8. Contact</h2>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:contact@lapassion-vip.fr"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-amber-400" />
                contact@lapassion-vip.fr
              </a>
            </div>
          </section>
        </motion.div>

        {/* Footer navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-6 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialite</Link>
            <Link href="/jeu-responsable" className="hover:text-white transition-colors">Jeu responsable</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
