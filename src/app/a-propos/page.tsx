'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Target,
  Shield,
  Heart,
  Zap,
  BarChart3,
  Eye,
  Gift,
  Mail,
  Trophy,
  Brain,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Valeurs
const values = [
  {
    icon: Eye,
    title: 'Transparence',
    description: 'Tous nos resultats sont publics. Nous affichons nos victoires comme nos defaites. Pas de cherry-picking.',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: Gift,
    title: 'Gratuite',
    description: 'Nous ne vendons pas de pronostics. Tout notre contenu est accessible gratuitement, sans aucun frais cache.',
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
  },
  {
    icon: Shield,
    title: 'Rigueur',
    description: 'Nos analyses sont basees sur les donnees et les statistiques, jamais sur l\'intuition ou les "tips".',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  {
    icon: Heart,
    title: 'Jeu Responsable',
    description: 'Nous promouvons une approche saine des paris. Le jeu doit rester un divertissement, pas une obsession.',
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
  },
];

// Etapes de la methodologie
const methodologySteps = [
  {
    step: '01',
    title: 'Collecte des Donnees',
    description: 'Nous aggregeons des donnees de multiples sources : statistiques de match, forme des equipes, blessures, suspensions, historique des confrontations.',
    icon: BarChart3,
  },
  {
    step: '02',
    title: 'Analyse IA',
    description: 'Notre intelligence artificielle analyse ces donnees en croisant des centaines de parametres : xG, possession, tirs cadres, motivation, enjeux.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Calcul de Value',
    description: 'Nous identifions les cotes qui offrent une "value" positive en comparant nos probabilites estimees aux cotes du marche.',
    icon: Target,
  },
  {
    step: '04',
    title: 'Publication',
    description: 'Les analyses sont publiees avec un niveau de confiance et des recommandations de mise basees sur le Kelly Criterion.',
    icon: Zap,
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 md:px-6">
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
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">A Propos</h1>
          </div>
          <p className="text-gray-400">
            Decouvrez notre mission, nos valeurs et notre methodologie.
          </p>
        </motion.div>

        {/* Notre Histoire */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <h2 className="text-xl font-bold text-white mb-4">Notre Histoire</h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>
              <strong className="text-white">PronoScope</strong> est nee d'un constat simple :
              le monde des pronostics sportifs est envahi par des "vendeurs de reves" qui promettent
              des taux de reussite irrealistes et vendent des "tips" sans aucune transparence.
            </p>
            <p>
              Nous avons decide de faire les choses differemment. Pas de promesses impossibles,
              pas de formules magiques. Juste des analyses rigoureuses basees sur les donnees,
              une transparence totale sur nos resultats, et surtout : <strong className="text-green-400">un acces 100% gratuit</strong>.
            </p>
            <p>
              Notre approche est simple : utiliser l'intelligence artificielle pour analyser
              des milliers de donnees et identifier les opportunites a valeur positive.
              Nous ne pretendons pas gagner a chaque fois - personne ne le peut. Mais nous
              visons une approche methodique et rentable sur le long terme.
            </p>
          </div>
        </motion.section>

        {/* Notre Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12 p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Notre Mission</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Fournir des analyses sportives de qualite, accessibles a tous, basees sur les donnees
            et non sur l'intuition. Promouvoir une approche responsable du jeu en offrant des
            outils d'aide a la decision transparents et gratuits.
          </p>
        </motion.section>

        {/* Nos Valeurs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-white mb-6">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className={`p-5 bg-gradient-to-br ${value.color} border ${value.border} rounded-xl`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <value.icon className={`w-5 h-5 ${value.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-white">{value.title}</h3>
                </div>
                <p className="text-gray-300 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Notre Methodologie */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Notre Methodologie</h2>
          </div>
          <div className="space-y-4">
            {methodologySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.1 }}
                className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">{step.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pourquoi Gratuit */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Pourquoi c'est Gratuit ?</h2>
          </div>
          <div className="space-y-3 text-gray-300 text-sm">
            <p>
              Nous croyons que l'information de qualite devrait etre accessible a tous.
              Voici pourquoi nous avons choisi la gratuite :
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Passion avant profit</strong> - Ce projet est ne d'une passion pour le sport et les donnees</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Contre les arnaques</strong> - Trop de "pronostiqueurs" vendent du reve, nous voulons offrir une alternative ethique</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Communaute</strong> - Nous preferons construire une communaute de passionnes plutot qu'un business</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">
                Vous pouvez nous soutenir via des dons volontaires, mais cela ne donne aucun avantage supplementaire.
                Tout le contenu reste accessible a tous, gratuitement.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Avertissement */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-12 p-6 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Avertissement Important</h2>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>
                  Les analyses et informations fournies sur ce site sont a titre <strong className="text-white">purement informatif</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-red-200/80">
                  <li>Nous ne sommes pas un operateur de jeux agree</li>
                  <li>Nous ne vendons aucun pronostic</li>
                  <li>Les performances passees ne garantissent pas les resultats futurs</li>
                  <li>Le jeu comporte des risques : endettement, isolement, dependance</li>
                </ul>
                <p className="mt-3">
                  Besoin d'aide ? Appelez le <a href="tel:0974751313" className="text-red-300 font-bold hover:underline">09 74 75 13 13</a> (appel non surtaxe)
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Contact</h2>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Une question, une suggestion ou un retour a nous faire ?
          </p>
          <a
            href="mailto:contact@lapassion-vip.fr"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors"
          >
            <Mail className="w-4 h-4" />
            contact@lapassion-vip.fr
          </a>
        </motion.section>

        {/* Footer navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10 pt-6 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/pronostics" className="hover:text-white transition-colors">Track Record</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions legales</Link>
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialite</Link>
            <Link href="/jeu-responsable" className="hover:text-white transition-colors">Jeu responsable</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
