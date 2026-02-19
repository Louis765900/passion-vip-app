// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Crown,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trophy,
  X,
  Send,
  AlertTriangle,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Particules animées en arrière-plan
const FloatingParticle = ({ delay, duration, x, y }: { delay: number; duration: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full opacity-60"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      opacity: [0.2, 0.8, 0.2],
      scale: [1, 1.5, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Gradient animé en arrière-plan
const AnimatedGradient = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -inset-[100%] opacity-30"
      animate={{
        background: [
          'radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
          'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)',
          'radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
          'radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // État pour la modale "Mot de passe oublié"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Particules générées
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 4,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setError(data.error || 'Identifiants incorrects');
        setIsLoading(false);
        return;
      }

      // Succès - rediriger selon le role retourne par l'API
      setSuccess(true);
      const redirectTo = data.redirect || '/';
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh(); // Force le layout a relire les cookies
      }, 1500);

    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError('Erreur de connexion au serveur');
      setIsLoading(false);
    }
  };

  // Animation de secousse
  const shakeAnimation = {
    x: shake ? [0, -10, 10, -10, 10, 0] : 0,
    transition: { duration: 0.5 }
  };

  // Handler pour "Mot de passe oublié"
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    // Simulation d'envoi (pas de backend mail pour l'instant)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setForgotLoading(false);
    setForgotSent(true);
  };

  // Fermer la modale et reset
  const closeForgotModal = () => {
    setShowForgotModal(false);
    // Reset après fermeture de l'animation
    setTimeout(() => {
      setForgotEmail('');
      setForgotSent(false);
    }, 300);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Arrière-plan avec image de stade */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070')`,
        }}
      />

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-900/90 to-black/95" />

      {/* Gradient animé */}
      <AnimatedGradient />

      {/* Particules flottantes */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Lignes de grille subtiles */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-2xl shadow-yellow-500/30 mb-4"
          >
            <Crown className="w-10 h-10 text-gray-900" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Prono
            </span>
            <span className="text-white">Scope</span>
          </h1>
          <p className="text-gray-400 text-sm">Accédez à votre espace exclusif</p>
        </motion.div>

        {/* Carte de Login - Glassmorphism */}
        <motion.div
          animate={shakeAnimation}
          className="relative"
        >
          {/* Glow effect derrière la carte */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-60" />

          <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Barre décorative dorée */}
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />

            <div className="p-8">
              {/* Badge VIP */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-full border border-yellow-500/30"
                >
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold tracking-wider uppercase">
                    Espace Sécurisé
                  </span>
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Champ Email/Code VIP */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email ou Code VIP
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/50 to-amber-500/50 rounded-lg blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="membre@pronosport.vip"
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                        required
                        disabled={isLoading || success}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Champ Mot de passe */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/50 to-amber-500/50 rounded-lg blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                        required
                        disabled={isLoading || success}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-gray-500 hover:text-yellow-400 transition-colors"
                        disabled={isLoading || success}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Message d'erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message de succès */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-green-400 text-sm">Connexion réussie ! Redirection...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton de connexion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <button
                    type="submit"
                    disabled={isLoading || success || !email || !password}
                    className="relative w-full group overflow-hidden"
                  >
                    {/* Glow animé au survol */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-lg opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />

                    <div className={`
                      relative flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300
                      ${success
                        ? 'bg-amber-500 text-white'
                        : isLoading
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-400 hover:to-yellow-400 hover:shadow-lg hover:shadow-amber-500/30'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Vérification...</span>
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Bienvenue !</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-5 h-5" />
                          <span>Accéder à l'espace VIP</span>
                        </>
                      )}

                      {/* Effet de brillance */}
                      {!isLoading && !success && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                      )}
                    </div>
                  </button>
                </motion.div>
              </form>

              {/* Separateur */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <span className="text-gray-500 text-xs mx-3">ou continuer avec</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              </div>

              {/* Bouton Google */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <a
                  href="/api/auth/google"
                  className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-all duration-300 border border-gray-200 w-full"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm">Continuer avec Google</span>
                </a>
              </motion.div>

              {/* Separateur 2 */}
              <div className="flex items-center mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <Sparkles className="w-4 h-4 text-yellow-500/50 mx-3" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              </div>

              {/* Liens footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="block w-full text-center text-gray-400 text-sm hover:text-yellow-400 transition-colors"
                >
                  Mot de passe oublie ?
                </button>

                <div className="text-center">
                  <span className="text-gray-500 text-sm">Pas encore membre ? </span>
                  <Link
                    href="/vip"
                    className="text-yellow-400 text-sm font-medium hover:text-yellow-300 transition-colors inline-flex items-center gap-1"
                  >
                    Devenir VIP
                    <Crown className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Footer de la carte */}
            <div className="px-8 py-4 bg-gray-950/50 border-t border-white/5">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-500/70" />
                  SSL Sécurisé
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-yellow-500/70" />
                  Données chiffrées
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Avertissement legal 18+ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 p-3 bg-amber-900/20 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 font-bold text-xs">18+</span>
            </div>
            <span className="text-amber-300/80 text-xs">Interdit aux mineurs</span>
          </div>
          <p className="text-[11px] text-amber-200/70 text-center leading-relaxed">
            Jouer comporte des risques : endettement, isolement, dependance.
          </p>
          <a
            href="tel:0974751313"
            className="flex items-center justify-center gap-1.5 mt-2 text-amber-300 text-xs hover:text-amber-200 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>09 74 75 13 13</span>
            <span className="text-amber-400/60">(appel non surtaxe)</span>
          </a>
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-600 text-xs mt-4"
        >
          &copy; 2025 PronoScope - Tous droits reservés
        </motion.p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODALE MOT DE PASSE OUBLIÉ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeForgotModal}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Contenu de la modale */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-60" />

              <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Barre dorée */}
                <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />

                <div className="p-6">
                  {/* Bouton fermer */}
                  <button
                    onClick={closeForgotModal}
                    className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-4">
                      <Mail className="w-7 h-7 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Mot de passe oublié
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                  </div>

                  {/* Formulaire ou Message de succès */}
                  <AnimatePresence mode="wait">
                    {!forgotSent ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleForgotPassword}
                        className="space-y-4"
                      >
                        {/* Champ email */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-lg blur opacity-0 group-focus-within:opacity-30 transition-opacity" />
                          <div className="relative flex items-center">
                            <Mail className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                            <input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="votre@email.com"
                              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                              required
                              disabled={forgotLoading}
                            />
                          </div>
                        </div>

                        {/* Bouton envoyer */}
                        <button
                          type="submit"
                          disabled={forgotLoading || !forgotEmail}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {forgotLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>Envoyer le lien</span>
                            </>
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4"
                        >
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </motion.div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                          Lien envoyé !
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
                        </p>
                        <button
                          onClick={closeForgotModal}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                        >
                          Fermer
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
