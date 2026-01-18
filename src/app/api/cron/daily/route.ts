import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    // 1. Vérification des clés
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const pplxKey = process.env.PERPLEXITY_API_KEY;
    const footballKey = process.env.API_FOOTBALL_KEY;
    const footballHost = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';

    if (!telegramToken || !chatId || !pplxKey || !footballKey) {
      return NextResponse.json({ error: "Clés API manquantes" }, { status: 500 });
    }

    // 2. Récupération des matchs
    const today = new Date().toISOString().split('T')[0];
    const leaguesIds = "2-39-61-135-140-78-6-9"; // J'ai ajouté quelques ligues (Coupes, etc.)
    
    const footResponse = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&ids=${leaguesIds}`, {
      headers: {
        'x-apisports-key': footballKey,
        'x-apisports-host': footballHost
      }
    });
    
    const footData = await footResponse.json();
    let matchesList = "Aucun match majeur trouvé dans l'API.";

    if (footData.response && footData.response.length > 0) {
      // On prend les 10 premiers matchs pour ne pas surcharger l'IA
      matchesList = footData.response.slice(0, 15).map((m: any) => 
        `- ${m.league.name}: ${m.teams.home.name} vs ${m.teams.away.name} (Heure: ${m.fixture.date.split('T')[1].slice(0,5)})`
      ).join('\n');
    }

    // 3. Le Prompt "Mode Silencieux"
    const promptIA = `
      Tu es un BOT de notification automatique. Tu n'es PAS un assistant conversationnel.
      
      INPUT (Liste des matchs) :
      ${matchesList}

      TÂCHE :
      Crée un post Telegram pour "La Passion VIP" avec les 3 meilleures affiches.

      RÈGLES IMPÉRATIVES (Si tu ne respectes pas, le système crash) :
      1. NE METS AUCUNE INTRODUCTION. Pas de "Voici le récap", pas de "Je dois clarifier".
      2. Commence DIRECTEMENT par l'émoji 👋.
      3. Utilise exactement ce format visuel :

      👋 *Le Récap VIP du ${today}*

      ➖➖➖➖➖➖➖

      ⚽ **[Equipe A] vs [Equipe B]**
      🏆 *[Nom de la Ligue]*
      💎 Tendance : [Vainqueur ou Double Chance]
      💥 Coup de Poker : [Buteur ou Score Exact]
      📝 [Analyse tactique en 15 mots max]

      (Répète pour les 2 autres matchs)

      ➖➖➖➖➖➖➖
      
      👉 *Retrouvez l'analyse détaillée sur le site !*
    `;

    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pplxKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: promptIA }]
      }),
    });

    const aiJson = await aiResponse.json();
    let finalMessage = aiJson.choices?.[0]?.message?.content || "Erreur analyse.";

    // NETTOYAGE DE SÉCURITÉ
    // Si l'IA est têtue et ajoute quand même du texte avant, on coupe tout ce qui est avant "👋"
    if (finalMessage.includes("👋")) {
      finalMessage = finalMessage.substring(finalMessage.indexOf("👋"));
    }

    // Remplacement des termes pour faire "VIP"
    finalMessage = finalMessage
      .replace(/Tendance/g, "Safe")
      .replace(/Coup de Poker/g, "Fun");

    // 4. Envoi Telegram
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const params = new URLSearchParams({
      chat_id: chatId,
      text: finalMessage,
      // On désactive le markdown auto pour éviter les bugs si l'IA met des astérisques bizarres
    });

    await fetch(`${telegramUrl}?${params}`);

    return NextResponse.json({ success: true, message: "Message envoyé !" });

  } catch (error) {
    console.error("Erreur Cron:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}