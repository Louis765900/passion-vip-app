import { Redis } from '@upstash/redis';
import { ShieldCheck, Star, TrendingUp, Calendar, AlertTriangle, Zap } from 'lucide-react';
import { getPriorityMatches, getMatchesByDate } from '@/services/football';

interface DailyMatch {
    fixture_id?: string | number;
    league?: string;
    home_team?: string;
    away_team?: string;
    pronostic?: string;
    confidence?: number;
    date?: string;
    time?: string;
    isTomorrow?: boolean;
}

async function getVipData() {
    let matchToShow: DailyMatch | null = null;
    let winsCount = 0;
    let totalCount = 0;

    // ---- Etape 1 : essayer Redis ----
    try {
        const redisUrl = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

        if (redisUrl && redisToken) {
            const redis = new Redis({ url: redisUrl, token: redisToken });

            const pipeline = redis.pipeline();
            pipeline.get('stats:vip:wins');
            pipeline.get('stats:vip:total');
            pipeline.get('vip:daily:match');
            pipeline.get('matches:today');

            const results = await pipeline.exec() as [
                [null | Error, number | null],
                [null | Error, number | null],
                [null | Error, DailyMatch | null],
                [null | Error, any[] | null]
            ];

            const wins = results[0]?.[1] ?? null;
            const total = results[1]?.[1] ?? null;
            const dailyMatch = results[2]?.[1] ?? null;
            const todayMatches = results[3]?.[1] ?? null;

            winsCount = typeof wins === 'number' ? wins : 0;
            totalCount = typeof total === 'number' ? total : 0;

            // Match VIP explicitement defini dans Redis — valider que la date est bien aujourd'hui
            const todayStr = new Date().toISOString().split('T')[0];
            if (dailyMatch && dailyMatch.fixture_id && dailyMatch.date === todayStr) {
                matchToShow = dailyMatch;
            }
            // Sinon prendre le premier match du cache Redis
            else if (todayMatches && Array.isArray(todayMatches) && todayMatches.length > 0) {
                // Chercher un match prioritaire (grandes ligues) en premier
                const priorityMatch = todayMatches.find((m: any) => m.isPriority) || todayMatches[0];
                matchToShow = {
                    fixture_id: priorityMatch.id || priorityMatch.fixtureId || 'cached',
                    league: priorityMatch.league || 'Match du jour',
                    home_team: priorityMatch.homeTeam || priorityMatch.home_team,
                    away_team: priorityMatch.awayTeam || priorityMatch.away_team,
                    pronostic: 'Cliquez pour generer l\'analyse VIP detaillee',
                    confidence: 0,
                    date: priorityMatch.date,
                    time: priorityMatch.time
                };
            }
        }
    } catch (error) {
        console.error("[VipCard] Redis error:", error);
    }

    // ---- Etape 2 : si toujours pas de match, API Football aujourd'hui ----
    if (!matchToShow) {
        try {
            const liveMatches = await getPriorityMatches();
            if (liveMatches.length > 0) {
                const best = liveMatches[0];
                matchToShow = {
                    fixture_id: best.id,
                    league: best.league,
                    home_team: best.homeTeam,
                    away_team: best.awayTeam,
                    pronostic: 'Match prioritaire - Cliquez pour l\'analyse VIP',
                    confidence: 0,
                    date: best.date,
                    time: best.time
                };
            }
        } catch (error) {
            console.error("[VipCard] API Football today error:", error);
        }
    }

    // ---- Etape 3 : si toujours rien, chercher les matchs de demain ----
    if (!matchToShow) {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowMatches = await getMatchesByDate(tomorrow);
            const priority = tomorrowMatches.find(m => m.isPriority) || tomorrowMatches[0];
            if (priority) {
                matchToShow = {
                    fixture_id: priority.id,
                    league: priority.league,
                    home_team: priority.homeTeam,
                    away_team: priority.awayTeam,
                    pronostic: 'Match de demain - Analyse VIP disponible',
                    confidence: 0,
                    date: priority.date,
                    time: priority.time,
                    isTomorrow: true
                };
            }
        } catch (error) {
            console.error("[VipCard] API Football tomorrow error:", error);
        }
    }

    // Taux de reussite UNIQUEMENT a partir de vraies donnees (minimum 5 analyses)
    const successRate = totalCount >= 5
        ? ((winsCount / totalCount) * 100).toFixed(1)
        : null;

    return { wins: winsCount, total: totalCount, successRate, dailyMatch: matchToShow };
}


export default async function VipConfidenceCard() {
    const { successRate, dailyMatch, total } = await getVipData();

    return (
        <div className="relative rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-5 md:p-6 shadow-2xl shadow-yellow-500/10 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge VIP */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full text-[11px] font-bold">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span>VIP</span>
            </div>

            {/* Taux de reussite - seulement si donnees reelles disponibles */}
            <div className="text-center mb-5">
                {successRate ? (
                    <>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Performance Historique</h3>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <TrendingUp className="h-7 w-7 text-amber-400" />
                            <p className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                                {successRate}%
                            </p>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Taux de reussite sur {total} analyses validees *</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Analyse VIP du Jour</h3>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <Zap className="h-6 w-6 text-yellow-400" />
                            <p className="text-lg md:text-xl font-semibold text-white">
                                Pronostics IA en temps reel
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent w-full mb-5" />

            {/* Match VIP du jour */}
            <div>
                <h4 className="flex items-center justify-center text-sm font-semibold text-gray-300 mb-3 gap-2">
                    <ShieldCheck className="h-4 w-4 text-yellow-400" />
                    {dailyMatch?.isTomorrow ? 'Match VIP de Demain' : 'Match VIP du Jour'}
                </h4>

                {dailyMatch ? (
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 rounded-xl p-4 text-center border border-white/5">
                        {/* Competition */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-3">
                            <span className="text-yellow-400 text-xs font-semibold">{dailyMatch.league}</span>
                        </div>

                        {/* Equipes */}
                        <p className="text-lg md:text-xl font-bold text-white my-2">
                            {dailyMatch.home_team}
                            <span className="text-gray-500 mx-2 text-sm font-normal">vs</span>
                            {dailyMatch.away_team}
                        </p>

                        {/* Date/Heure */}
                        {dailyMatch.time && (
                            <p className="text-xs text-gray-400 mb-3 flex items-center justify-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {dailyMatch.date && <span>{dailyMatch.date}</span>}
                                <span>a {dailyMatch.time}</span>
                            </p>
                        )}

                        {/* Pronostic ou CTA */}
                        {dailyMatch.confidence && dailyMatch.confidence > 0 ? (
                            <>
                                <div className="mt-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg inline-block">
                                    <p className="text-sm font-semibold text-amber-400">
                                        {dailyMatch.pronostic}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${
                                        dailyMatch.confidence >= 75 ? 'bg-amber-400' :
                                        dailyMatch.confidence >= 55 ? 'bg-amber-400' : 'bg-red-400'
                                    }`} />
                                    <span className="text-xs text-gray-400">
                                        Confiance : <span className="font-semibold text-white">{dailyMatch.confidence}%</span>
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="mt-2 flex items-center justify-center gap-2 text-neon-green">
                                <Zap className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Analyse disponible - Cliquez sur le match ci-dessous
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-white/5">
                        <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                            <Zap className="h-5 w-5" />
                            <span className="font-medium text-sm">Aucun match programme pour le moment</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Les matchs du jour seront affiches des qu'ils seront disponibles.
                        </p>
                    </div>
                )}
            </div>

            {/* Avertissement legal */}
            <div className="mt-4 pt-3 border-t border-gray-700/30">
                <p className="text-[10px] text-gray-600 text-center leading-relaxed">
                    <AlertTriangle className="h-3 w-3 inline mr-1 -mt-0.5" />
                    * Les performances passees ne garantissent pas les resultats futurs.
                    Pariez responsablement. 18+
                </p>
            </div>
        </div>
    );
}
