# AUDIT COMPLET - PronoScope

**Date de l'audit** : 29 janvier 2026
**Version du projet** : 1.0.0
**URL de production** : https://pronoscope.vercel.app/

---

## 1. TECH STACK IDENTIFIE

### Framework & Runtime
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 14.2.0 | Framework React avec App Router |
| React | 18.2.0 | Librairie UI |
| TypeScript | 5.3.0 | Typage statique |
| Node.js | - | Runtime serveur |

### Base de donnees
| Technologie | Usage |
|-------------|-------|
| **Upstash Redis** | Base de donnees principale (KV store) |
| - | Stockage des utilisateurs (`user:{email}`) |
| - | Stockage des paris utilisateurs |
| - | Stockage des subscriptions push |

### Authentification
| Methode | Details |
|---------|---------|
| **Cookie-based auth** | Implementation custom (pas NextAuth.js) |
| Cookies utilises | `vip_session`, `user_role`, `user_email` |
| Duree session | 7 jours |
| Hashage MDP | bcrypt.js |
| Roles | `admin`, `vip`, `free` |

### APIs externes
| Service | Usage |
|---------|-------|
| **API-Football** | Donnees des matchs en temps reel |
| **Tavily** | Recherche web pour analyses IA |
| **Web Push** | Notifications push |

### UI & Styling
| Technologie | Usage |
|-------------|-------|
| Tailwind CSS | 3.4.0 | Styling |
| Framer Motion | 11.18.2 | Animations |
| Lucide React | 0.363.0 | Icones |
| Recharts | 3.6.0 | Graphiques |
| Sonner | 2.0.7 | Toasts/Notifications |

### PWA
| Feature | Status |
|---------|--------|
| Service Worker | Oui (`public/sw.js`) |
| Manifest | Oui (`public/manifest.json`) |
| Icones PWA | Oui (72x72 a 512x512) |
| iOS Support | Oui (splash screens, meta tags) |

---

## 2. ARCHITECTURE DES FICHIERS

```
src/
├── app/
│   ├── page.tsx                    # Dashboard principal (protege)
│   ├── layout.tsx                  # Layout racine + PWA setup
│   ├── globals.css                 # Styles globaux
│   ├── login/page.tsx              # Page connexion (publique)
│   ├── vip/page.tsx                # Page de vente VIP (publique)
│   ├── join/page.tsx               # Page invitation (publique)
│   ├── admin/page.tsx              # Terminal admin (admin only)
│   ├── matchs/page.tsx             # Liste des matchs (protege)
│   ├── mes-paris/page.tsx          # Mes paris (VIP/admin)
│   ├── stats/page.tsx              # Statistiques publiques
│   ├── jeu-responsable/page.tsx    # Page jeu responsable
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # Login/logout/session check
│       │   └── google/route.ts     # OAuth Google (en cours)
│       ├── matches/route.ts        # API matchs
│       ├── pronostic/
│       │   ├── route.ts            # Generation pronostics IA
│       │   └── stream/route.ts     # Streaming analyses
│       ├── user/
│       │   ├── bankroll/route.ts   # Gestion bankroll
│       │   └── bets/route.ts       # Gestion paris
│       ├── stats/
│       │   ├── route.ts            # Stats globales
│       │   └── predictions/route.ts # Stats predictions
│       ├── push/
│       │   ├── subscribe/route.ts  # Abonnement push
│       │   └── notify/route.ts     # Envoi notifications
│       ├── admin/
│       │   ├── terminal/route.ts   # Commandes terminal
│       │   ├── invite/route.ts     # Invitations VIP
│       │   └── publish/route.ts    # Publication pronos
│       └── cron/
│           ├── daily/route.ts      # CRON quotidien
│           └── check-results/route.ts # Verification resultats
├── components/
│   ├── Navbar.tsx                  # Navigation principale
│   ├── Header.tsx                  # Header dashboard
│   ├── LegalFooter.tsx             # Footer avec mentions legales
│   ├── AgeVerificationPopup.tsx    # Popup 18+ a l'entree
│   ├── BankrollSetupPopup.tsx      # Config bankroll
│   ├── MatchCard.tsx               # Carte match
│   ├── LeagueSection.tsx           # Section par ligue
│   ├── VipConfidenceCard.tsx       # Carte confiance VIP
│   ├── PronosticResult.tsx         # Affichage pronostic
│   ├── PredictionTracker.tsx       # Suivi predictions
│   ├── StreamingAnalysis.tsx       # Analyse en streaming
│   ├── DashboardClient.tsx         # Dashboard cote client
│   ├── LoadingSkeleton.tsx         # Squelettes chargement
│   ├── bankroll/                   # Composants bankroll
│   ├── charts/                     # Graphiques
│   ├── chat/                       # Widget chat
│   ├── mes-paris/                  # Composants paris
│   └── social/                     # Partage social
├── hooks/
│   ├── useBankroll.ts              # Hook gestion bankroll
│   ├── useSyncedBankroll.ts        # Sync bankroll serveur
│   ├── usePronostic.ts             # Hook pronostics
│   └── usePushNotifications.ts     # Hook notifications
├── services/
│   └── football.ts                 # Service API-Football
├── types/
│   └── index.ts                    # Types TypeScript
└── middleware.ts                   # Middleware auth
```

---

## 3. PAGES EXISTANTES

### Pages Publiques (sans authentification)
| Route | Fichier | Description |
|-------|---------|-------------|
| `/login` | `src/app/login/page.tsx` | Page de connexion |
| `/vip` | `src/app/vip/page.tsx` | Page de vente VIP |
| `/join` | `src/app/join/page.tsx` | Page d'invitation |
| `/jeu-responsable` | `src/app/jeu-responsable/page.tsx` | Page jeu responsable |

### Pages Protegees (authentification requise)
| Route | Fichier | Description | Roles |
|-------|---------|-------------|-------|
| `/` | `src/app/page.tsx` | Dashboard principal | Tous |
| `/matchs` | `src/app/matchs/page.tsx` | Liste des matchs | Tous |
| `/mes-paris` | `src/app/mes-paris/page.tsx` | Mes paris | VIP, Admin |
| `/stats` | `src/app/stats/page.tsx` | Statistiques | Tous |
| `/admin` | `src/app/admin/page.tsx` | Terminal admin | Admin |

---

## 4. CONFORMITE LEGALE - ETAT ACTUEL

### CE QUI EXISTE

| Element | Status | Fichier | Notes |
|---------|--------|---------|-------|
| Page Jeu Responsable | OK | `src/app/jeu-responsable/page.tsx` | Complete avec numero d'aide |
| Footer legal | OK | `src/components/LegalFooter.tsx` | 18+, numero, liens ressources |
| Popup verification age | OK | `src/components/AgeVerificationPopup.tsx` | Session storage |
| Disclaimers | OK | Integres dans les pages | Avertissements visibles |

### CE QUI MANQUE (CRITIQUE)

| Element | Status | Route prevue | Priorite |
|---------|--------|--------------|----------|
| **Mentions legales** | MANQUANT | `/mentions-legales` | URGENT |
| **CGU** | MANQUANT | `/cgu` | URGENT |
| **Politique de confidentialite** | MANQUANT | `/confidentialite` | URGENT |
| **Bandeau cookies RGPD** | MANQUANT | - | URGENT |

### LIENS CASSES DANS LE FOOTER
Le composant `LegalFooter.tsx` contient des liens vers des pages qui n'existent pas :
- `<Link href="/mentions-legales">` -> 404
- `<Link href="/cgu">` -> 404
- `<Link href="/confidentialite">` -> 404

---

## 5. PROBLEME LEGAL MAJEUR - MODELE ECONOMIQUE

### Situation actuelle (page `/vip`)
La page VIP affiche des tarifs :
- **Mensuel** : 29EUR/mois
- **Annuel** : 199EUR/an (au lieu de 348EUR)

### Probleme
**La vente directe de pronostics sportifs est potentiellement illegale en France** selon l'ANJ (Autorite Nationale des Jeux).

### Solution recommandee
Passer a un modele 100% gratuit avec monetisation par :
1. Affiliation vers bookmakers agrees ANJ
2. Donations volontaires (Buy Me A Coffee, etc.)
3. Publicite contextuelle

---

## 6. COMPOSANTS CLES ANALYSES

### Authentification (`src/app/api/auth/login/route.ts`)
- Connexion par email/mot de passe
- Support admin via `ADMIN_SECRET`
- Utilisateurs stockes dans Redis (`user:{email}`)
- Fallback hardcode pour tests (`membre@pronosport.vip`)

### Middleware (`src/middleware.ts`)
- Protection des routes non-publiques
- Verification role admin pour `/admin`
- Routes publiques : `/login`, `/join`, `/vip`, `/api/auth`, `/api/cron`, `/api/stats`

### Service Football (`src/services/football.ts`)
- Integration API-Football (v3.football.api-sports.io)
- Ligues prioritaires : Ligue 1, Premier League, La Liga, Serie A, Bundesliga, Champions League
- Cache Next.js : 5-10 minutes

---

## 7. ACTIONS REQUISES - PHASE 1

### Priorite URGENTE (Semaine 1)

1. **Creer les pages legales manquantes**
   - [ ] `/mentions-legales/page.tsx`
   - [ ] `/cgu/page.tsx`
   - [ ] `/confidentialite/page.tsx`

2. **Ajouter bandeau cookies RGPD**
   - [ ] Installer `react-cookie-consent`
   - [ ] Creer composant `CookieBanner.tsx`
   - [ ] Integrer dans `layout.tsx`

3. **Corriger le modele economique**
   - [ ] Retirer les prix de `/vip`
   - [ ] Transformer en page vitrine gratuite
   - [ ] Ajouter liens affiliation vers bookmakers agrees

4. **Ameliorer les disclaimers**
   - [ ] Ajouter "Site informatif, pas operateur de jeux"
   - [ ] Clarifier que les pronostics sont gratuits

---

## 8. RESUME TECHNIQUE

### Points forts
- Architecture moderne (Next.js 14 App Router)
- PWA complete et fonctionnelle
- UI/UX professionnelle
- Systeme d'auth fonctionnel
- Integration API-Football
- Page jeu responsable complete
- Footer legal avec avertissements

### Points a ameliorer
- Pages legales manquantes (3 pages)
- Pas de bandeau cookies RGPD
- Modele economique a revoir
- OAuth Google non fonctionnel
- Pas de sitemap/robots.txt

### Dependencies a ajouter
```bash
npm install react-cookie-consent next-sitemap
```

---

## 9. VARIABLES D'ENVIRONNEMENT REQUISES

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Admin
ADMIN_SECRET=

# API Football
API_FOOTBALL_HOST=v3.football.api-sports.io
API_FOOTBALL_KEY=

# Tavily (IA)
TAVILY_API_KEY=

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Google OAuth (en cours)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Analytics (a configurer)
NEXT_PUBLIC_GA_ID=
```

---

## 10. PROCHAINES ETAPES

1. **Immediate** : Creer les 3 pages legales manquantes
2. **Immediate** : Ajouter le bandeau cookies RGPD
3. **Cette semaine** : Transformer la page VIP en vitrine gratuite
4. **Semaine prochaine** : Configurer Google Analytics
5. **Semaine prochaine** : Ajouter sitemap et robots.txt

---

**Audit realise par Claude Code**
**Projet : PronoScope**
