import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. CONFIGURATION
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const footballKey = process.env.API_FOOTBALL_KEY;
    
    // 👇 C'EST ICI QUE TU DOIS CONNECTER TA BASE DE DONNÉES
    // Tu dois récupérer les paris qui ont le statut "PENDING" (En attente)
    // Exemple fictif de données :
    const pendingBets = [
      { id: 1, matchId: 123456, teamHome: 'PSG', teamAway: 'Lyon', prediction: 'HOME_WIN', status: 'PENDING' }
    ]; 
    // ^ Remplace ça par : const pendingBets = await db.bets.find({ status: 'PENDING' })

    if (pendingBets.length === 0) {
      return NextResponse.json({ message: "Aucun pari en attente." });
    }

    let notifications = [];

    // 2. VÉRIFICATION DES RÉSULTATS
    for (const bet of pendingBets) {
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${bet.matchId}`, {
        headers: { 'x-apisports-key': footballKey || '' }
      });
      const data = await response.json();
      const match = data.response[0];

      // Si le match est FINI (FT = Full Time, AET = After Extra Time, PEN = Penalties)
      if (['FT', 'AET', 'PEN'].includes(match.fixture.status.short)) {
        
        const homeGoals = match.goals.home;
        const awayGoals = match.goals.away;
        let isWon = false;

        // Logique de validation simple
        if (bet.prediction === 'HOME_WIN' && homeGoals > awayGoals) isWon = true;
        else if (bet.prediction === 'AWAY_WIN' && awayGoals > homeGoals) isWon = true;
        else if (bet.prediction === 'DRAW' && homeGoals === awayGoals) isWon = true;
        // ... Ajouter d'autres logiques (Over 2.5, etc.) ici

        if (isWon) {
          // 3. ENVOI DE LA NOTIFICATION "GAGNÉ"
          const message = `
✅ **BOOM ! C'EST VALIDÉ !** 🤑

⚽ ${bet.teamHome} vs ${bet.teamAway}
💎 Prono : ${bet.prediction}
📊 Score final : ${homeGoals} - ${awayGoals}

👉 La bankroll augmente ! 🚀
          `;
          
          // Envoi Telegram
          await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
          });

          notifications.push(`Pari ${bet.id} gagné !`);
          
          // 👇 IMPORTANT : METTRE À JOUR TA BDD ICI
          // await db.bets.update({ id: bet.id }, { status: 'WON' });

        } else {
          // Pari Perdu
          // await db.bets.update({ id: bet.id }, { status: 'LOST' });
          notifications.push(`Pari ${bet.id} perdu.`);
        }
      }
    }

    return NextResponse.json({ success: true, updates: notifications });

  } catch (error: any) {
    console.error("Erreur Checker:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}