'use client';

import { motion } from 'framer-motion';
import { FileText, ArrowLeft, AlertTriangle, Users, Shield, Ban, CheckCircle2, Phone } from 'lucide-react';
import Link from 'next/link';

export default function CGUPage() {
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
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Conditions Generales d'Utilisation</h1>
          </div>
          <p className="text-gray-400">
            Derniere mise a jour : 29 janvier 2026
          </p>
        </motion.div>

        {/* Avertissement important */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Avertissement Important</h2>
              <p className="text-gray-300 text-sm mb-3">
                Ce site est reserve aux personnes majeures (18 ans et plus).
                Les informations fournies sont a titre indicatif uniquement et ne constituent
                pas des conseils financiers ou des incitations a parier.
              </p>
              <div className="flex items-center gap-2 text-amber-300 text-sm">
                <Phone className="w-4 h-4" />
                <span>Aide : <a href="tel:0974751313" className="underline font-medium">09 74 75 13 13</a> (appel non surtaxe)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Article 1 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 1 - Objet</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Les presentes Conditions Generales d'Utilisation (CGU) regissent l'acces et l'utilisation
                du site PronoScope (ci-apres "le Site").
              </p>
              <p>
                L'acces au Site implique l'acceptation pleine et entiere des presentes CGU.
                Si vous n'acceptez pas ces conditions, vous devez cesser d'utiliser le Site.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 2 - Description du service</h2>
            <div className="space-y-4 text-gray-300 text-sm">
              <p>
                Le Site propose un service <strong className="text-white">gratuit</strong> d'analyses sportives
                generees par intelligence artificielle a titre purement informatif.
              </p>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">Service 100% Gratuit</span>
                </div>
                <p className="text-green-200/80">
                  Ce site ne vend aucun pronostic ni abonnement. L'ensemble du contenu est accessible gratuitement.
                  Aucun paiement n'est requis pour acceder aux analyses.
                </p>
              </div>
              <p>
                Le Site n'est pas un operateur de jeux d'argent et n'est pas agree par l'ANJ
                (Autorite Nationale des Jeux). Il ne propose aucune prise de paris.
              </p>
            </div>
          </section>

          {/* Article 3 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Article 3 - Acces au service</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p><strong className="text-white">3.1 Conditions d'acces</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Etre age de 18 ans minimum</li>
                <li>Disposer d'une adresse email valide pour la creation de compte</li>
                <li>Accepter les presentes CGU</li>
              </ul>
              <p><strong className="text-white">3.2 Creation de compte</strong></p>
              <p>
                L'utilisateur s'engage a fournir des informations exactes lors de son inscription.
                Il est responsable de la confidentialite de ses identifiants de connexion.
              </p>
              <p><strong className="text-white">3.3 Gratuite</strong></p>
              <p>
                L'inscription et l'utilisation du Site sont entierement gratuites.
                Les dons volontaires sont acceptes mais ne donnent aucun avantage supplementaire.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-bold text-white">Article 4 - Comportements interdits</h2>
            </div>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>Il est strictement interdit de :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Utiliser le Site a des fins illegales ou frauduleuses</li>
                <li>Tenter de compromettre la securite du Site</li>
                <li>Collecter les donnees des autres utilisateurs</li>
                <li>Revendre ou redistribuer le contenu du Site</li>
                <li>Utiliser des robots ou scripts automatises</li>
                <li>Creer plusieurs comptes pour contourner les limitations</li>
              </ul>
            </div>
          </section>

          {/* Article 5 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Article 5 - Limitation de responsabilite</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-sm">
              <p><strong className="text-white">5.1 Nature informative</strong></p>
              <p>
                Les analyses et informations fournies sur le Site sont presentees a titre purement
                indicatif et educatif. Elles ne constituent en aucun cas :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Des conseils financiers ou d'investissement</li>
                <li>Des garanties de gains</li>
                <li>Des incitations a parier</li>
              </ul>

              <p><strong className="text-white">5.2 Absence de garantie</strong></p>
              <p>
                L'editeur ne garantit pas l'exactitude, la completude ou l'actualite des informations
                diffusees. Les performances passees ne prejugent pas des resultats futurs.
              </p>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-300 font-medium mb-2">Avertissement</p>
                <p className="text-amber-200/80">
                  L'utilisateur reconnait que toute decision de pari est prise sous sa seule responsabilite.
                  L'editeur decline toute responsabilite en cas de pertes financieres.
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 6 - Jeu responsable</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Le Site encourage une pratique responsable des jeux d'argent et rappelle que :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Les jeux d'argent sont reserves aux personnes majeures</li>
                <li>Jouer comporte des risques : endettement, isolement, dependance</li>
                <li>Il est important de se fixer des limites de temps et d'argent</li>
                <li>Le jeu doit rester un divertissement, pas une source de revenus</li>
              </ul>
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 font-medium mb-2">Besoin d'aide ?</p>
                <p className="text-red-200/80">
                  Appelez le <a href="tel:0974751313" className="underline font-medium">09 74 75 13 13</a> (appel non surtaxe)
                  ou visitez <a href="https://www.joueurs-info-service.fr" target="_blank" rel="noopener noreferrer" className="underline">joueurs-info-service.fr</a>
                </p>
              </div>
            </div>
          </section>

          {/* Article 7 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 7 - Propriete intellectuelle</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                L'ensemble des contenus du Site (textes, images, logos, analyses, code source)
                sont proteges par le droit d'auteur et restent la propriete exclusive de l'editeur.
              </p>
              <p>
                Toute reproduction ou utilisation non autorisee est interdite.
              </p>
            </div>
          </section>

          {/* Article 8 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 8 - Donnees personnelles</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                La collecte et le traitement des donnees personnelles sont regis par notre{' '}
                <Link href="/confidentialite" className="text-amber-400 hover:underline">
                  Politique de Confidentialite
                </Link>, conforme au RGPD.
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 9 - Modification des CGU</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                L'editeur se reserve le droit de modifier les presentes CGU a tout moment.
                Les utilisateurs seront informes de toute modification substantielle.
                L'utilisation continue du Site apres modification vaut acceptation des nouvelles CGU.
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Article 10 - Droit applicable</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                Les presentes CGU sont regies par le droit francais.
                Tout litige relatif a leur interpretation ou execution sera soumis aux tribunaux francais competents.
              </p>
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
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions legales</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialite</Link>
            <Link href="/jeu-responsable" className="hover:text-white transition-colors">Jeu responsable</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
