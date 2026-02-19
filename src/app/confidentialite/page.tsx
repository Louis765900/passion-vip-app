'use client';

import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Database, Cookie, Eye, Trash2, Mail, Shield, Server, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function ConfidentialitePage() {
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
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Lock className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Politique de Confidentialite</h1>
          </div>
          <p className="text-gray-400">
            Derniere mise a jour : 29 janvier 2026
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl"
        >
          <p className="text-gray-300 text-sm">
            La protection de vos donnees personnelles est une priorite pour PronoScope.
            Cette politique de confidentialite vous informe sur la maniere dont nous collectons,
            utilisons et protegeons vos informations personnelles, conformement au
            <strong className="text-white"> Reglement General sur la Protection des Donnees (RGPD)</strong>.
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Responsable du traitement */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">1. Responsable du traitement</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Le responsable du traitement des donnees collectees sur ce site est :
              </p>
              <p><strong className="text-white">PronoScope</strong></p>
              <p>Contact : <a href="mailto:contact@lapassion-vip.fr" className="text-amber-400 hover:underline">contact@lapassion-vip.fr</a></p>
            </div>
          </section>

          {/* Donnees collectees */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">2. Donnees collectees</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm">
              <p><strong className="text-white">2.1 Donnees fournies directement par l'utilisateur</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Adresse email (lors de l'inscription)</li>
                <li>Mot de passe (stocke de maniere chiffree)</li>
                <li>Preferences de bankroll (montant, parametres)</li>
                <li>Historique des paris simules</li>
              </ul>

              <p><strong className="text-white">2.2 Donnees collectees automatiquement</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Adresse IP (anonymisee)</li>
                <li>Type de navigateur et systeme d'exploitation</li>
                <li>Pages visitees et duree des visites</li>
                <li>Donnees de cookies (voir section 5)</li>
              </ul>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-300 font-medium mb-2">Donnees NON collectees</p>
                <p className="text-green-200/80">
                  Nous ne collectons jamais : donnees bancaires, numero de telephone,
                  adresse postale, pieces d'identite.
                </p>
              </div>
            </div>
          </section>

          {/* Finalites */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">3. Finalites du traitement</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>Vos donnees sont utilisees pour :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Gerer votre compte et authentification</li>
                <li>Personnaliser votre experience (bankroll, historique)</li>
                <li>Envoyer des notifications push (si vous y avez consenti)</li>
                <li>Ameliorer nos services et statistiques d'utilisation</li>
                <li>Assurer la securite du site</li>
              </ul>
              <p className="mt-4">
                <strong className="text-white">Base legale :</strong> Consentement de l'utilisateur et execution du contrat (CGU).
              </p>
            </div>
          </section>

          {/* Conservation */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">4. Duree de conservation</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Type de donnee</th>
                    <th className="text-left py-2 text-white">Duree de conservation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Donnees de compte</td>
                    <td className="py-2">Jusqu'a suppression du compte + 1 an</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Historique des paris</td>
                    <td className="py-2">3 ans maximum</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Cookies analytics</td>
                    <td className="py-2">13 mois maximum</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Logs de connexion</td>
                    <td className="py-2">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Cookies */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold text-white">5. Cookies</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm">
              <p><strong className="text-white">5.1 Cookies essentiels (obligatoires)</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="text-amber-300">vip_session</code> : Session utilisateur (7 jours)</li>
                <li><code className="text-amber-300">user_role</code> : Role de l'utilisateur</li>
                <li><code className="text-amber-300">age_verified</code> : Verification 18+ (session)</li>
                <li><code className="text-amber-300">cookie_consent</code> : Choix cookies RGPD</li>
              </ul>

              <p><strong className="text-white">5.2 Cookies analytiques (optionnels)</strong></p>
              <p>
                Nous utilisons des cookies analytiques pour comprendre comment vous utilisez notre site.
                Ces cookies sont soumis a votre consentement.
              </p>

              <p><strong className="text-white">5.3 Gestion des cookies</strong></p>
              <p>
                Vous pouvez modifier vos preferences de cookies a tout moment via le bandeau de consentement
                ou les parametres de votre navigateur.
              </p>
            </div>
          </section>

          {/* Partage des donnees */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">6. Partage et transfert des donnees</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm">
              <p><strong className="text-white">6.1 Sous-traitants</strong></p>
              <p>Vos donnees peuvent etre traitees par nos sous-traitants :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Vercel</strong> : Hebergement (USA - Clauses contractuelles types)</li>
                <li><strong>Upstash</strong> : Base de donnees Redis (chiffrement des donnees)</li>
              </ul>

              <p><strong className="text-white">6.2 Aucune vente de donnees</strong></p>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-300">
                  Nous ne vendons jamais vos donnees personnelles a des tiers.
                  Vos informations ne sont jamais partagees a des fins commerciales.
                </p>
              </div>
            </div>
          </section>

          {/* Vos droits */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">7. Vos droits RGPD</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm">
              <p>Conformement au RGPD, vous disposez des droits suivants :</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Droit d'acces</h4>
                  <p className="text-xs">Obtenir une copie de vos donnees personnelles</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Droit de rectification</h4>
                  <p className="text-xs">Corriger vos donnees si elles sont inexactes</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Droit a l'effacement</h4>
                  <p className="text-xs">Demander la suppression de vos donnees</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Droit a la portabilite</h4>
                  <p className="text-xs">Recevoir vos donnees dans un format lisible</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Droit d'opposition</h4>
                  <p className="text-xs">Vous opposer a certains traitements</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Droit de limitation</h4>
                  <p className="text-xs">Limiter l'utilisation de vos donnees</p>
                </div>
              </div>

              <p className="mt-4">
                Pour exercer ces droits, contactez-nous a{' '}
                <a href="mailto:contact@lapassion-vip.fr" className="text-amber-400 hover:underline">contact@lapassion-vip.fr</a>
              </p>
            </div>
          </section>

          {/* Suppression du compte */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-bold text-white">8. Suppression du compte</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Vous pouvez demander la suppression de votre compte a tout moment en nous contactant.
                La suppression entrainera :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Effacement de vos donnees personnelles</li>
                <li>Suppression de votre historique de paris</li>
                <li>Desactivation de vos preferences</li>
              </ul>
              <p>
                Certaines donnees peuvent etre conservees pour des obligations legales (logs de securite).
              </p>
            </div>
          </section>

          {/* Securite */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">9. Securite des donnees</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>Nous mettons en oeuvre des mesures de securite appropriees :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Chiffrement des mots de passe (bcrypt)</li>
                <li>Connexions HTTPS securisees</li>
                <li>Acces restreint aux donnees</li>
                <li>Hebergement securise (Vercel + Upstash)</li>
              </ul>
            </div>
          </section>

          {/* Reclamation */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">10. Reclamation</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Si vous estimez que vos droits ne sont pas respectes, vous pouvez introduire
                une reclamation aupres de la CNIL :
              </p>
              <p>
                <strong className="text-white">CNIL</strong><br />
                3 Place de Fontenoy - TSA 80715<br />
                75334 PARIS CEDEX 07<br />
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">www.cnil.fr</a>
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">11. Contact</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Pour toute question relative a cette politique de confidentialite ou a vos donnees personnelles :
            </p>
            <a
              href="mailto:contact@lapassion-vip.fr"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Mail className="w-4 h-4" />
              contact@lapassion-vip.fr
            </a>
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
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions legales</Link>
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/jeu-responsable" className="hover:text-white transition-colors">Jeu responsable</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
