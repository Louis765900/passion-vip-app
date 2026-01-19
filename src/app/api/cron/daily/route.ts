import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const redis = Redis.fromEnv();

export async function GET(req: Request) {
  try {
    // 1. CONFIGURATION
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const groqKey = process.env.GROQ_API_KEY;
    const footballKey = process.env.API_FOOTBALL_KEY;
    const siteUrl = "https://pronosport-vip-kh2g.vercel.app"; 

    if (!telegramToken || !chatId || !groqKey || !footballKey) {
      return NextResponse.json({ error: "Clés manquantes" }, { status: 500 });
    }

    // 2. RECUPERATION MATCHS
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = tomorrow.toISOString().split('T')[0];
    const leaguesIds = "61-39-140-135-78-2-3-62-40-94-88-203-307"; 
    
    const footResponse = await fetch(`https://v3.football.api-sports.io/fixtures?from=${dateFrom}&to=${dateTo}&ids=${leaguesIds}&timezone=Europe/Paris`, {
      headers: { 'x-apisports-key': footballKey }
    });
    
    const footData = await footResponse.json();
    let topMatches: any[] = [];
    let isTestMode = false;

    // 👇 LE FILET DE SÉCURITÉ 👇
    if (!footData.response || footData.response.length === 0) {
       console.log("⚠️ API vide ou Quota dépassé -> Activation du MODE TEST");
       isTestMode = true;
       // On injecte des faux matchs pour vérifier que le bot marche
       topMatches = [
         { fixture: { id: 999001, date: `${dateFrom}T21:00:00` }, teams: { home: { name: "TEST Paris SG" }, away: { name: "TEST Marseille" } }, league: { name: "Ligue 1 (Test)" } },
         { fixture: { id: 999002, date: `${dateFrom}T21:00:00` }, teams: { home: { name: "TEST Real Madrid" }, away: { name: "TEST Barça" } }, league: { name: "Liga (Test)" } },
         { fixture: { id: 999003, date: `${dateFrom}T21:00:00` }, teams: { home: { name: "TEST Arsenal" }, away: { name: "TEST Chelsea" } }, league: { name: "Premier League (Test)" } }
       ];
    } else {
      topMatches = footData.response.slice(0, 3);
    }

    // Préparation pour l'IA
    const matchesDataForAI = topMatches.map((m: any, index: number) => {
      return `MATCH_${index + 1} (ID:${m.fixture.id}): ${m.teams.home.name} vs ${m.teams.away.name} - ${m.league.name}`;
    }).join('\n\n');

    // 3. GENERATION IA
    const promptUser = `
      Tu es l'algorithme "Pronosport VIP".
      
      Voici les matchs :
      ${matchesDataForAI}

      ${isTestMode ? "ATTENTION: Ce sont des matchs de TEST fictifs. Traite-les comme des vrais pour l'exemple." : ""}

      TÂCHE : Génère 3 pronostics techniques courts.
      RÈGLES : Pas de noms de joueurs. Format strict.

      FORMAT :
      🔥 **LA SÉLECTION DU MOMENT** ${isTestMode ? "(TEST TECHNIQUE)" : "🔥"}
      👇👇👇
      (Pour chaque match)
      ⚽ **[Equipe A] vs [Equipe B]**
      🏆 *[Ligue]*
      🟢 **SAFE :** [Prono court]
      💣 **FUN :** [Prono court]
      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
      🤖 **Pronostics IA.**
      👉 ${siteUrl}
    `;

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptUser }],
        temperature: 0.3, 
      }),
    });

    const aiJson = await aiResponse.json();
    let finalMessage = aiJson.choices?.[0]?.message?.content || "Erreur IA";
    if (finalMessage.includes("🔥")) finalMessage = finalMessage.substring(finalMessage.indexOf("🔥"));

    // 4. SAUVEGARDE ET ENVOI
    for (const match of topMatches) {
        // On sauvegarde quand même pour tester la base de données
        await redis.set(`pending_match:${match.fixture.id}`, {
            home: match.teams.home.name,
            away: match.teams.away.name,
            date: match.fixture.date,
            ai_analysis: finalMessage
        });
        await redis.expire(`pending_match:${match.fixture.id}`, 172800);
    }

    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    await fetch(`${telegramUrl}?${new URLSearchParams({ chat_id: chatId, text: finalMessage })}`);

    return NextResponse.json({ 
        success: true, 
        mode: isTestMode ? "TEST (API vide/quota)" : "LIVE",
        saved_matches: topMatches.length 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}