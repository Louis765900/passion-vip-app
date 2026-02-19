import { AlertTriangle, Phone, ExternalLink, Heart, Shield, Clock, Ban } from 'lucide-react';
import Link from 'next/link';

export default function JeuResponsablePage() {
  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Jeu Responsable</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Jouez de maniere <span className="text-amber-400">responsable</span>
          </h1>
          <p className="text-white/60">
            Les jeux d'argent doivent rester un divertissement. Voici nos conseils pour garder le controle.
          </p>
        </div>

        {/* Bandeau d'urgence */}
        <div className="p-6 bg-gradient-to-r from-red-900/30 to-amber-900/30 border border-red-500/30 rounded-xl mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <Phone className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Besoin d'aide ?</h2>
              <p className="text-white/70 mb-3">
                Si vous ou un proche avez des difficultes avec les jeux d'argent, appelez :
              </p>
              <a
                href="tel:0974751313"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-red-300 font-bold text-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                09 74 75 13 13
              </a>
              <p className="text-white/50 text-sm mt-2">Appel non surtaxe - 7j/7</p>
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Nos conseils pour jouer responsable
          </h2>

          <div className="grid gap-4">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Fixez-vous des limites
              </h3>
              <p className="text-white/60 text-sm">
                Definissez a l'avance un budget et un temps de jeu maximum.
                Ne depassez jamais ces limites, meme en cas de gains.
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                Ne jouez jamais pour recuperer vos pertes
              </h3>
              <p className="text-white/60 text-sm">
                C'est le piege le plus frequent. Acceptez les pertes comme faisant partie du jeu.
                Arreter apres une perte est une decision sage.
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Le jeu n'est pas une source de revenus
              </h3>
              <p className="text-white/60 text-sm">
                Les jeux d'argent sont un divertissement, pas un moyen de gagner sa vie.
                Les gains ne sont jamais garantis.
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Faites des pauses regulieres
              </h3>
              <p className="text-white/60 text-sm">
                Prenez du recul regulierement. Si le jeu devient une obsession ou
                affecte votre vie quotidienne, c'est le moment de s'arreter.
              </p>
            </div>
          </div>
        </div>

        {/* Signes d'alerte */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Signes d'une pratique problematique
          </h2>

          <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-xl">
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                Vous jouez plus que prevu (temps ou argent)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                Vous mentez a vos proches sur vos habitudes de jeu
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                Vous empruntez de l'argent pour jouer
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                Le jeu affecte votre travail, vos relations ou votre sante
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                Vous vous sentez anxieux ou irritable quand vous ne jouez pas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                Vous jouez pour echapper a vos problemes
              </li>
            </ul>

            <p className="mt-4 text-red-300 font-medium">
              Si vous vous reconnaissez dans un ou plusieurs de ces signes, demandez de l'aide.
            </p>
          </div>
        </div>

        {/* Ressources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Ressources utiles</h2>

          <div className="grid gap-4">
            <a
              href="https://www.joueurs-info-service.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group"
            >
              <div>
                <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                  Joueurs Info Service
                </h3>
                <p className="text-white/50 text-sm">Site officiel d'aide aux joueurs</p>
              </div>
              <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-blue-400" />
            </a>

            <a
              href="https://www.addictaide.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors group"
            >
              <div>
                <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                  Addict'Aide
                </h3>
                <p className="text-white/50 text-sm">Village des addictions</p>
              </div>
              <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-purple-400" />
            </a>

            <a
              href="https://www.sos-joueurs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/50 transition-colors group"
            >
              <div>
                <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                  SOS Joueurs
                </h3>
                <p className="text-white/50 text-sm">Association d'aide aux joueurs</p>
              </div>
              <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-green-400" />
            </a>
          </div>
        </div>

        {/* Retour */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
