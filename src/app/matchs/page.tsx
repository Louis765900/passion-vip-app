// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Trophy,
  Shield,
  Flame,
  Send,
  RefreshCw,
  Clock,
  TrendingUp,
  Star,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Target,
  Crown,
  Loader2,
  ChevronRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface Combine {
  id: string;
  type: "safe" | "fun";
  title: string;
  cote: number;
  mise: number;
  matches: {
    equipe1: string;
    equipe2: string;
    prono: string;
    competition: string;
    heure: string;
  }[];
  status: "pending" | "won" | "lost";
  createdAt: string;
  analysis?: string;
}

export default function CombineesVIPPage() {
  const [combines, setCombines] = useState<Combine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "safe" | "fun">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchCombines();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/login");
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(data.authenticated);
        setUserRole(data.role);
        setIsAdmin(data.role === "admin");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const fetchCombines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/combines");
      if (res.ok) {
        const data = await res.json();
        setCombines(data.combines || []);
      }
    } catch (error) {
      console.error("Fetch combines failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareToTelegram = async (combine: Combine) => {
    const matchesText = combine.matches
      .map((m) => `⚽ ${m.equipe1} vs ${m.equipe2}\n   📌 ${m.prono} (${m.competition})`)
      .join("\n\n");

    const emoji = combine.type === "safe" ? "🛡️" : "🔥";
    const typeLabel = combine.type === "safe" ? "SAFE" : "FUN";

    const message = `
${emoji} *COMBINÉ ${typeLabel}* ${emoji}

${matchesText}

💰 *Cote totale:* ${combine.cote.toFixed(2)}
💵 *Mise conseillée:* ${combine.mise}€

🤖 _Analyse Perplexity AI_
${combine.analysis || "Combiné étudié avec soin par notre IA."}

━━━━━━━━━━━━━━━
🏆 *PronoScope* - Pronostics IA
    `.trim();

    // Encoder pour l'URL Telegram
    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent("https://pronoscope.vercel.app")}&text=${encodedMessage}`;

    window.open(telegramUrl, "_blank");
  };

  const copyToClipboard = async (combine: Combine) => {
    const matchesText = combine.matches
      .map((m) => `${m.equipe1} vs ${m.equipe2} → ${m.prono}`)
      .join("\n");

    const text = `🎯 COMBINÉ ${combine.type.toUpperCase()}\n\n${matchesText}\n\nCote: ${combine.cote.toFixed(2)} | Mise: ${combine.mise}€`;

    await navigator.clipboard.writeText(text);
    setCopiedId(combine.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCombines = combines.filter((c) => {
    if (activeTab === "all") return true;
    return c.type === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" /> GAGNÉ
          </span>
        );
      case "lost":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
            <AlertCircle className="w-3 h-3" /> PERDU
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
            <Clock className="w-3 h-3" /> EN COURS
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} userRole={userRole as any} />

      {/* Hero Section with Football Background */}
      <div className="relative overflow-hidden min-h-[500px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&q=80"
            alt="Football stadium"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/80 to-gray-950" />
          {/* Animated orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold">Analysé par Perplexity AI</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6">
              Combinées{" "}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                VIP
              </span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Nos meilleures sélections quotidiennes analysées par intelligence artificielle.
              <br className="hidden md:block" />
              Tickets <span className="text-green-400 font-semibold">SAFE</span> et{" "}
              <span className="text-orange-400 font-semibold">FUN</span> pour tous les profils.
            </p>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {[
                { value: "87%", label: "Taux Safe", color: "from-green-500/20 to-green-600/10", border: "border-green-500/30" },
                { value: "2.5x", label: "Cote Moyenne", color: "from-amber-500/20 to-yellow-600/10", border: "border-amber-500/30" },
                { value: "+340€", label: "Ce Mois", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`px-6 py-4 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} backdrop-blur-sm`}
                >
                  <div className="text-3xl md:text-4xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-gray-500"
              >
                <span className="text-sm">Voir les combinés</span>
                <ChevronRight className="w-5 h-5 rotate-90" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16 -mt-8 relative z-10">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { id: "all", label: "Tous", icon: Trophy },
            { id: "safe", label: "Safe", icon: Shield },
            { id: "fun", label: "Fun", icon: Flame },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${activeTab === tab.id
                  ? tab.id === "safe"
                    ? "bg-green-500 text-black shadow-lg shadow-green-500/30"
                    : tab.id === "fun"
                    ? "bg-orange-500 text-black shadow-lg shadow-orange-500/30"
                    : "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchCombines}
            disabled={isLoading}
            className="ml-4 p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement des combinés...</p>
          </div>
        ) : filteredCombines.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun combiné disponible</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Les nouveaux combinés sont publiés chaque jour. Revenez bientôt !
            </p>
          </motion.div>
        ) : (
          /* Combines Grid */
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCombines.map((combine, index) => (
                <motion.div
                  key={combine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative group rounded-2xl overflow-hidden
                    ${combine.type === "safe"
                      ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20"
                      : "bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20"
                    }
                  `}
                >
                  {/* Glow Effect */}
                  <div
                    className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      ${combine.type === "safe"
                        ? "bg-gradient-to-br from-green-500/5 to-transparent"
                        : "bg-gradient-to-br from-orange-500/5 to-transparent"
                      }
                    `}
                  />

                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            ${combine.type === "safe"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                            }
                          `}
                        >
                          {combine.type === "safe" ? (
                            <Shield className="w-6 h-6" />
                          ) : (
                            <Flame className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg">{combine.title}</h3>
                            {combine.type === "safe" && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase">
                                Safe
                              </span>
                            )}
                            {combine.type === "fun" && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-full uppercase">
                                Fun
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {combine.matches.length} sélection{combine.matches.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(combine.status)}
                    </div>

                    {/* Matches */}
                    <div className="space-y-3 mb-4">
                      {combine.matches.map((match, i) => (
                        <div
                          key={i}
                          className="bg-black/30 rounded-xl p-3 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm">
                              {match.equipe1} vs {match.equipe2}
                            </span>
                            <span className="text-gray-500 text-xs">{match.heure}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`
                                text-sm font-semibold
                                ${combine.type === "safe" ? "text-green-400" : "text-orange-400"}
                              `}
                            >
                              {match.prono}
                            </span>
                            <span className="text-gray-600 text-xs">{match.competition}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Analysis */}
                    {combine.analysis && (
                      <div className="bg-black/20 rounded-xl p-3 mb-4 border border-white/5">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                          <Sparkles className="w-3 h-3" />
                          Analyse IA
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{combine.analysis}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Cote</div>
                          <div
                            className={`
                              text-xl font-black
                              ${combine.type === "safe" ? "text-green-400" : "text-orange-400"}
                            `}
                          >
                            {combine.cote.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Mise</div>
                          <div className="text-xl font-black text-white">{combine.mise}€</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Gain</div>
                          <div className="text-xl font-black text-amber-400">
                            {(combine.cote * combine.mise).toFixed(0)}€
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(combine)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                          title="Copier"
                        >
                          {copiedId === combine.id ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => shareToTelegram(combine)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-lg text-sm font-semibold transition-all"
                          >
                            <Send className="w-4 h-4" />
                            Telegram
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
