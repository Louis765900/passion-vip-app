"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, Lock, Mail, ArrowRight, Loader2, CheckCircle, AlertTriangle, Phone, Shield } from "lucide-react";
import Link from "next/link";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Case a cocher obligatoire 18+
  const [isAdult, setIsAdult] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verification 18+
    if (!isAdult) {
      setError("Vous devez certifier avoir plus de 18 ans pour continuer.");
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token: token || null }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Festif */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831&auto=format&fit=crop')] bg-cover opacity-20 blur-sm"></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Bandeau 18+ */}
        <div className="bg-gradient-to-r from-amber-900/50 to-red-900/50 border border-amber-500/30 rounded-t-2xl px-4 py-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold text-sm">18+</span>
          </div>
          <span className="text-amber-200/90 text-xs">Interdit aux mineurs</span>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-yellow-500/30 border-t-0 rounded-b-2xl p-8 shadow-2xl">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4 shadow-lg shadow-yellow-500/20">
                  <Gift className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{token ? 'Invitation VIP Offerte' : 'Créer un compte'}</h1>
                <p className="text-gray-400 text-sm">{token ? 'Créez votre compte pour activer votre accès exclusif.' : 'Rejoignez PronoScope gratuitement.'}</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 text-white focus:border-yellow-500 outline-none transition"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold ml-1">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 text-white focus:border-yellow-500 outline-none transition"
                      placeholder="Minimum 8 caracteres"
                      minLength={8}
                    />
                  </div>
                </div>

                {/* Cases a cocher obligatoires */}
                <div className="space-y-3 pt-2">
                  {/* Case 18+ obligatoire */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={isAdult}
                        onChange={(e) => setIsAdult(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:border-yellow-500 peer-checked:bg-yellow-500 transition-all flex items-center justify-center">
                        {isAdult && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      <span className="text-red-400 font-semibold">*</span> Je certifie avoir plus de <span className="text-yellow-400 font-bold">18 ans</span> et comprends que les jeux d'argent sont interdits aux mineurs.
                    </span>
                  </label>

                  {/* Case CGU */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:border-yellow-500 peer-checked:bg-yellow-500 transition-all flex items-center justify-center">
                        {acceptTerms && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      <span className="text-red-400 font-semibold">*</span> J'accepte les{' '}
                      <Link href="/cgu" className="text-yellow-400 underline hover:text-yellow-300">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/confidentialite" className="text-yellow-400 underline hover:text-yellow-300">
                        politique de confidentialite
                      </Link>.
                    </span>
                  </label>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isAdult || !acceptTerms}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      {token ? 'Activer mon Pass VIP' : 'Créer mon compte'} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Avertissement legal */}
              <div className="mt-6 p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-200/80 leading-relaxed">
                    <p className="font-semibold mb-1">Jouer comporte des risques : endettement, isolement, dependance.</p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      Appelez le <a href="tel:0974751313" className="text-amber-300 font-medium underline">09 74 75 13 13</a> (appel non surtaxe)
                    </p>
                  </div>
                </div>
              </div>

              {/* Lien connexion */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Deja membre ?{' '}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  Se connecter
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Compte Active !</h2>
              <p className="text-gray-400">Redirection vers l'espace membre...</p>
            </div>
          )}
        </div>

        {/* Badge securite */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-green-500/70" />
            <span>SSL Securise</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-yellow-500/70" />
            <span>Donnees chiffrees</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
