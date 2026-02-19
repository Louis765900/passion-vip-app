# Plan d'implementation

## 1. Corriger l'auto-check des paris (bankroll ne bouge pas)

**Probleme identifie:** Le systeme `/api/user/bets/check` a 2 failles :
- Quand `determineBetResult()` retourne `'pending'` malgre un match termine (le pattern market/selection ne matche aucun cas connu), il n'y a PAS de fallback Perplexity. Le fallback Perplexity ne s'active que si `API_FOOTBALL_KEY` est completement absent.
- Si le match n'est pas trouve par API Football (pas de fixtureId ni de date), le pari reste bloque.

**Corrections :**
- Ajouter un fallback Perplexity dans la boucle principale quand `determineBetResult` retourne `'pending'` mais que le match est bien termine (status FT/AET/PEN)
- Ajouter un fallback Perplexity quand le match n'est pas trouve du tout par API Football
- Ajouter un log plus explicite pour debug

**Fichiers :**
- `src/app/api/user/bets/check/route.ts`

## 2. Remplacer le panel admin par un terminal de commandes

**Probleme identifie:** La page admin actuelle affiche un "brouillon" (JSON de pronostics IA) dans un layout editorial. L'utilisateur veut un terminal de commandes admin.

**Nouveau design :**
- Interface terminal dark avec prompt `admin>`
- Input de commande en bas, historique qui scroll vers le haut
- Couleur Gold/Amber pour les accents (coherent avec la charte)

**Commandes a implementer :**
| Commande | Description |
|----------|-------------|
| `help` | Liste toutes les commandes |
| `users` | Liste tous les utilisateurs inscrits |
| `users count` | Nombre d'utilisateurs |
| `stats` | Statistiques globales (paris, bankroll, win rate) |
| `bets <email>` | Voir les paris d'un utilisateur |
| `bankroll <email>` | Voir la bankroll d'un utilisateur |
| `check-bets` | Forcer la verification de tous les paris pending |
| `telegram <message>` | Envoyer un message Telegram |
| `generate` | Lancer la generation de pronostics (CRON) |
| `invite` | Generer un lien d'invitation VIP |
| `publish` | Publier le brouillon sur Telegram |
| `draft` | Voir le brouillon actuel |
| `clear` | Effacer le terminal |
| `status` | Statut du systeme (Redis, APIs, etc.) |

**Fichiers :**
- `src/app/admin/page.tsx` - Remplacement complet
- `src/app/api/admin/terminal/route.ts` - Nouveau endpoint API pour executer les commandes

## 3. Unifier la charte graphique Gold/Amber

**Changement :** Remplacer le neon-green (#39ff14) par Gold/Amber (#F59E0B / #D97706) partout.

**Fichiers a modifier :**
- `tailwind.config.js` - Remplacer les couleurs neon par gold
- `src/app/globals.css` - Remplacer #39ff14 par gold, adapter les utilities
- `src/app/layout.tsx` - Changer le theme-color meta tag
- `src/app/page.tsx` - Remplacer text-neon-green par text-amber-500
- `src/components/Header.tsx` - Couleurs gold
- `src/components/MatchCard.tsx` - Couleurs gold
- `src/components/PronosticResult.tsx` - Couleurs gold
- `src/components/LeagueSection.tsx` - Couleurs gold
- `src/components/DashboardClient.tsx` - Couleurs gold
- `src/components/VipConfidenceCard.tsx` - Deja gold, verifier coherence
- `src/components/PredictionTracker.tsx` - Couleurs gold
- `src/components/bankroll/BankrollWidget.tsx` - Couleurs gold
- `src/components/bankroll/BetButton.tsx` - Couleurs gold
- `src/components/charts/BankrollChart.tsx` - Couleurs gold
- `src/components/mes-paris/MesParisClient.tsx` - Couleurs gold

**Strategie :**
- Renommer `neon-green` en `gold` dans tailwind config
- Utiliser search/replace pour `neon-green` -> `amber-500` et `neon` -> `gold` dans les classes CSS
- Les couleurs gold principales : `#F59E0B` (amber-500), `#D97706` (amber-600), `#FBBF24` (amber-400)
- Glow/shadow : rgba(245, 158, 11, 0.3) au lieu de rgba(57, 255, 20, 0.3)

## 4. Build et verification finale
- `npx next build` pour verifier zero erreurs
