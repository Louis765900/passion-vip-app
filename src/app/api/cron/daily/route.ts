import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    // 1. VERIFICATION DES CLES
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const groqKey = process.env.GROQ_API_KEY;
    const footballKey = process.env.API_FOOTBALL_KEY;
    const footballHost = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';

    if (!telegramToken || !chatId || !groqKey || !footballKey) {
      return NextResponse.json({ error: "Clés manquantes sur Vercel" }, { status: 500 });
    }

    // 2. RECUPERATION DES MATCHS
    const today = new Date().toISOString().split('T')[0];
    const leaguesIds = "2-39-61-135-140-78";
    
    const footResponse = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&ids=${leaguesIds}`, {
      headers: {
        'x-apisports-key': footballKey,
        'x-apisports-host': footballHost
      }
    });
    
    const footData = await footResponse.json();
    let matchesList = "Pas de matchs majeurs aujourd'hui. Invente une analyse sur l'actu foot.";

    if (footData.response && footData.response.length > 0) {
      matchesList = footData.response.slice(0, 15).map((m: any) => 
        `- ${m.league.name}: ${m.teams.home.name} vs ${m.teams.away.name} (${m.fixture.date.split('T')[1].slice(0,5)})`
      ).join('\n');
    }

    // 3. GENERATION GROQ (NOUVEAU MODELE)
    const promptUser = `
      Tu es un expert en paris sportifs.
      Voici les matchs : ${matchesList}

      TÂCHE : Rédige le post Telegram du jour (3 meilleures affiches).

      FORMAT STRICT :
      👋 *La Sélection VIP du ${today}*
      ➖➖➖➖➖➖➖
      ⚽ **[Equipe A] vs [Equipe B]**
      🏆 *[Ligue]*
      💎 Safe : [Prono fiable]
      💥 Fun : [Prono risqué]
      (Répète pour les 2 autres matchs)
      ➖➖➖➖➖➖➖
      👉 *Analyse détaillée sur le site !*

      IMPORTANT : Pas d'intro. Commence par 👋.
    `;

    // Utilisation du modèle Llama 3.3 (Plus stable)
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Nouveau modèle !
        messages: [
          { role: "system", content: "Tu es un bot Telegram." },
          { role: "user", content: promptUser }
        ],
        temperature: 0.6,
      }),
    });

    const aiJson = await aiResponse.json();
    
    // DEBUG : Si erreur, on l'affiche clairement
    if (aiJson.error) {
        console.error("Erreur Groq Détail:", aiJson.error);
        return NextResponse.json({ 
            error: "Erreur Groq Reçue", 
            details: aiJson.error.message || JSON.stringify(aiJson.error) 
        }, { status: 500 });
    }

    let finalMessage = aiJson.choices?.[0]?.message?.content || "Erreur analyse.";

    if (finalMessage.includes("👋")) {
      finalMessage = finalMessage.substring(finalMessage.indexOf("👋"));
    }

    // 4. ENVOI TELEGRAM
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const params = new URLSearchParams({
      chat_id: chatId,
      text: finalMessage,
    });

    await fetch(`${telegramUrl}?${params}`);

    return NextResponse.json({ success: true, message: "Envoyé avec Llama 3.3 !" });

  } catch (error: any) {
    console.error("Erreur Cron:", error);
    return NextResponse.json({ error: "Erreur interne", details: error.message }, { status: 500 });
  }
}