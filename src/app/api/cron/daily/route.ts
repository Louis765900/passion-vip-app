import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    // 1. CONFIGURATION ET CLES
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const groqKey = process.env.GROQ_API_KEY;
    const footballKey = process.env.API_FOOTBALL_KEY;
    const footballHost = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';
    const siteUrl = "https://pronosport-vip-kh2g.vercel.app"; 

    if (!telegramToken || !chatId || !groqKey || !footballKey) {
      return NextResponse.json({ error: "Clés manquantes" }, { status: 500 });
    }

    // 2. RECUPERATION DES VRAIS MATCHS (Données API Football)
    const today = new Date().toISOString().split('T')[0];
    // Priorité aux ligues majeures : LDC(2), PL(39), L1(61), Serie A(135), Liga(140), Bundesliga(78)
    const leaguesIds = "2-39-61-135-140-78"; 
    
    const footResponse = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&ids=${leaguesIds}&timezone=Europe/Paris`, {
      headers: { 'x-apisports-key': footballKey, 'x-apisports-host': footballHost }
    });
    
    const footData = await footResponse.json();
    let matchesDataForAI = "";

    if (!footData.response || footData.response.length === 0) {
       // Cas rare : pas de match majeur, on annule l'envoi pour ne pas dire de bêtises
       return NextResponse.json({ message: "Pas de gros matchs aujourd'hui, pas de post." });
    } else {
      // On prend les 3 premiers matchs triés par importance (l'API les trie souvent par défaut)
      const topMatches = footData.response.slice(0, 3);
      
      matchesDataForAI = topMatches.map((m: any, index: number) => {
        return `MATCH ${index + 1}:
        - Affiche : ${m.teams.home.name} vs ${m.teams.away.name}
        - Ligue : ${m.league.name}
        - Heure : ${m.fixture.date.split('T')[1].slice(0,5)}`;
      }).join('\n\n');
    }

    // 3. GENERATION DU PRONOSTIC (Strictement technique)
    // On demande à l'IA d'agir comme l'algorithme du site : pas de blabla, juste le résultat logique.
    const promptUser = `
      Tu es l'algorithme de prédiction du site "Pronosport VIP".
      
      Voici les 3 matchs officiels du jour :
      ${matchesDataForAI}

      TÂCHE :
      Pour chaque match, génère uniquement les pronostics techniques basés sur la hiérarchie des équipes.
      
      RÈGLES ABSOLUES (Sécurité) :
      1. INTERDICTION de citer des joueurs (Pas de Mbappé, pas de Haaland). Risque d'hallucination.
      2. INTERDICTION de faire des phrases d'analyse ou de commentaire.
      3. Reste sur des marchés fiables : "Victoire", "Double Chance", "Les deux équipes marquent", "Over/Under 2.5 buts".

      FORMAT DE SORTIE ATTENDU (Copie strictement ce modèle) :

      🔥 **LA SÉLECTION DU JOUR** 🔥
      📅 *${today}*

      👇👇👇

      (Pour le Match 1)
      ⚽ **[Equipe A] vs [Equipe B]**
      🏆 *[Nom de la Ligue]*
      🟢 **SAFE :** [Le pari le plus probable (cote ~1.50)]
      💣 **FUN :** [Un pari plus audacieux (cote ~2.50) MAIS PAS DE BUTEUR]

      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

      (Répète pour le Match 2)
      [...]

      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

      (Répète pour le Match 3)
      [...]

      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

      🤖 **Ces pronostics sont générés par l'IA du site.**
      📊 **Voir l'analyse complète et les % de confiance :**
      👉 ${siteUrl}
    `;

    // Appel Groq
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Tu es un générateur de données JSON transformé en texte. Tu es froid, précis et tu ne connais pas les joueurs." },
          { role: "user", content: promptUser }
        ],
        temperature: 0.3, // Température TRÈS basse pour éviter toute invention
      }),
    });

    const aiJson = await aiResponse.json();
    
    if (aiJson.error) return NextResponse.json({ error: aiJson.error.message }, { status: 500 });

    let finalMessage = aiJson.choices?.[0]?.message?.content || "Erreur.";

    // Nettoyage final pour s'assurer que ça commence bien
    if (finalMessage.includes("🔥")) {
      finalMessage = finalMessage.substring(finalMessage.indexOf("🔥"));
    }

    // 4. ENVOI
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const params = new URLSearchParams({
      chat_id: chatId,
      text: finalMessage,
    });

    await fetch(`${telegramUrl}?${params}`);

    return NextResponse.json({ success: true, message: "Envoyé (Mode Algorithme Site)" });

  } catch (error: any) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}