'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  BarChart3,
  TrendingUp,
  Share2,
  ChevronRight,
  AlertTriangle,
  Target,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

// Types
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Guides' | 'Analyses' | 'Actualites';
  date: string;
  readTime: string;
  content: React.ReactNode;
  author: {
    name: string;
    role: string;
  };
  relatedPosts: string[];
}

// Category colors
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Guides: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Analyses: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Actualites: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
};

const categoryIcons: Record<string, React.ElementType> = {
  Guides: BookOpen,
  Analyses: BarChart3,
  Actualites: TrendingUp,
};

// Blog posts content
const blogPosts: Record<string, BlogPost> = {
  'comment-analyser-match-football-guide-complet': {
    slug: 'comment-analyser-match-football-guide-complet',
    title: 'Comment Analyser un Match de Football : Guide Complet 2026',
    excerpt: 'Decouvrez les techniques et statistiques essentielles pour analyser un match de football comme un professionnel.',
    category: 'Guides',
    date: '2026-01-28',
    readTime: '8 min',
    author: { name: 'PronoScope', role: 'Equipe Editoriale' },
    relatedPosts: ['expected-goals-xg-comprendre-statistique-cle', 'top-5-erreurs-paris-sportifs'],
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          L'analyse d'un match de football ne se resume pas a regarder le classement. Pour prendre des decisions eclairees,
          il est essentiel de comprendre les statistiques cles et de savoir les interpreter correctement.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          1. Les Expected Goals (xG)
        </h2>
        <p className="text-gray-300 mb-4">
          Les <strong className="text-white">Expected Goals</strong> mesurent la qualite des occasions creees par une equipe.
          Un xG de 2.5 signifie que l'equipe aurait du marquer environ 2.5 buts en moyenne, compte tenu de la qualite de ses tirs.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-blue-200 text-sm">
            <strong>Astuce :</strong> Comparez toujours les xG aux buts reellement marques. Une equipe qui marque plus que ses xG
            sur la duree pourrait connaitre une regression. A l'inverse, une equipe qui marque moins pourrait s'ameliorer.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          2. La Forme Recente
        </h2>
        <p className="text-gray-300 mb-4">
          La forme des 5 derniers matchs est un indicateur crucial. Mais attention a ne pas vous fier uniquement aux resultats :
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Analysez la qualite des adversaires affrontes</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Regardez si les matchs etaient a domicile ou a l'exterieur</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Considerez les joueurs absents (blessures, suspensions)</span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          3. Les Confrontations Directes (H2H)
        </h2>
        <p className="text-gray-300 mb-4">
          L'historique des confrontations peut reveler des tendances interessantes, mais doit etre utilise avec prudence :
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Utile quand
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Les effectifs sont stables</li>
              <li>Les matchs sont recents (&lt;2 ans)</li>
              <li>Les enjeux sont similaires</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Moins fiable quand
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Les entraineurs ont change</li>
              <li>Les effectifs sont tres differents</li>
              <li>Les matchs datent de plus de 3 ans</li>
            </ul>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          4. Les Statistiques Defensives
        </h2>
        <p className="text-gray-300 mb-4">
          Ne negligez pas la defense ! Les statistiques defensives sont souvent plus stables et predictibles que les stats offensives :
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2 text-gray-300">
            <span className="text-amber-400 font-bold">xGA</span>
            <span>Expected Goals Against - la qualite des occasions concedees</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <span className="text-amber-400 font-bold">PPDA</span>
            <span>Passes par action defensive - mesure la pression appliquee</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <span className="text-amber-400 font-bold">Clean Sheets</span>
            <span>Matchs sans encaisser de but</span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Le Contexte du Match</h2>
        <p className="text-gray-300 mb-4">
          Le contexte est souvent sous-estime. Posez-vous ces questions :
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Quels sont les enjeux pour chaque equipe ? (titre, maintien, rien a jouer)</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Y a-t-il eu un match important en milieu de semaine ?</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Y a-t-il un match important a venir ? (rotation possible)</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span>Des tensions internes ou un changement d'entraineur recent ?</span>
          </li>
        </ul>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-amber-400 mb-3">Conclusion</h3>
          <p className="text-gray-300">
            L'analyse d'un match de football est un exercice complexe qui demande de croiser plusieurs sources de donnees.
            N'oubliez jamais que meme la meilleure analyse ne garantit pas le resultat - le football reste imprevisible,
            c'est ce qui fait sa beaute.
          </p>
        </div>
      </div>
    ),
  },
  'top-5-erreurs-paris-sportifs': {
    slug: 'top-5-erreurs-paris-sportifs',
    title: 'Top 5 Erreurs a Eviter en Paris Sportifs',
    excerpt: 'Les erreurs les plus courantes des parieurs et comment les eviter pour ameliorer vos resultats sur le long terme.',
    category: 'Guides',
    date: '2026-01-25',
    readTime: '6 min',
    author: { name: 'PronoScope', role: 'Equipe Editoriale' },
    relatedPosts: ['comment-analyser-match-football-guide-complet', 'expected-goals-xg-comprendre-statistique-cle'],
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          Les paris sportifs peuvent sembler simples en apparence, mais de nombreux parieurs commettent des erreurs qui
          peuvent couter cher sur le long terme. Voici les 5 erreurs les plus frequentes et comment les eviter.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full text-red-400 font-bold">1</span>
          Parier sans Bankroll Management
        </h2>
        <p className="text-gray-300 mb-4">
          La gestion de bankroll est <strong className="text-white">fondamentale</strong>. Parier de grosses sommes sur un seul match
          ou augmenter les mises apres une serie de pertes est le moyen le plus sur de tout perdre.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-200 text-sm">
            <strong>Solution :</strong> Definissez une bankroll dedie (que vous pouvez vous permettre de perdre) et ne misez
            jamais plus de 1-5% de cette bankroll sur un seul pari. Utilisez le critere de Kelly pour optimiser vos mises.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full text-red-400 font-bold">2</span>
          Courir apres les Pertes
        </h2>
        <p className="text-gray-300 mb-4">
          Apres une serie de defaites, la tentation est forte d'augmenter les mises pour "se refaire". C'est exactement
          ce qu'il ne faut pas faire.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-200 text-sm">
            <strong>Solution :</strong> Gardez toujours la meme discipline de mise, quelle que soit votre serie. Une mauvaise
            passe fait partie du jeu. Faites une pause si vous sentez que les emotions prennent le dessus.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full text-red-400 font-bold">3</span>
          Ignorer la Value
        </h2>
        <p className="text-gray-300 mb-4">
          Parier sur le favori n'est pas forcement le bon choix. Ce qui compte, c'est si la cote offerte represente
          une <strong className="text-white">valeur positive</strong> par rapport a la probabilite reelle de l'evenement.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-200 text-sm">
            <strong>Solution :</strong> Apprenez a estimer les probabilites reelles et comparez-les aux cotes proposees.
            Si votre probabilite estimee est superieure a la probabilite implicite de la cote, vous avez une value bet.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full text-red-400 font-bold">4</span>
          Multiplier les Combines
        </h2>
        <p className="text-gray-300 mb-4">
          Les combines (accumulateurs) sont seduisants avec leurs cotes elevees, mais ils sont mathematiquement defavorables
          au parieur sur le long terme.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-200 text-sm">
            <strong>Solution :</strong> Privilegiez les paris simples. Si vous faites des combines, limitez-vous a 2-3 selections
            maximum et uniquement sur des evenements que vous avez analyses en profondeur.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full text-red-400 font-bold">5</span>
          Parier avec ses Emotions
        </h2>
        <p className="text-gray-300 mb-4">
          Parier sur votre equipe favorite ou contre une equipe que vous n'aimez pas sont des biais emotionnels qui faussent
          votre jugement.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <p className="text-green-200 text-sm">
            <strong>Solution :</strong> Basez vos decisions uniquement sur les donnees et l'analyse. Si vous etes trop implique
            emotionnellement dans un match, il vaut mieux ne pas parier du tout.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-amber-400 mb-3">A Retenir</h3>
          <p className="text-gray-300">
            Le succes en paris sportifs repose sur la discipline, la patience et l'analyse. Ce n'est pas un sprint mais
            un marathon. Les meilleurs parieurs gagnent en evitant les erreurs, pas en cherchant le gros coup.
          </p>
        </div>
      </div>
    ),
  },
  'expected-goals-xg-comprendre-statistique-cle': {
    slug: 'expected-goals-xg-comprendre-statistique-cle',
    title: 'Expected Goals (xG) : Comprendre cette Statistique Cle',
    excerpt: 'Tout ce que vous devez savoir sur les Expected Goals, la statistique qui revolutionne l\'analyse du football moderne.',
    category: 'Guides',
    date: '2026-01-20',
    readTime: '10 min',
    author: { name: 'PronoScope', role: 'Equipe Editoriale' },
    relatedPosts: ['comment-analyser-match-football-guide-complet', 'top-5-erreurs-paris-sportifs'],
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          Les <strong className="text-white">Expected Goals (xG)</strong> sont devenus la statistique incontournable du football moderne.
          Mais que mesurent-ils exactement et comment les utiliser pour vos analyses ? Ce guide complet vous explique tout.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">Qu'est-ce que les Expected Goals ?</h2>
        <p className="text-gray-300 mb-4">
          Les xG mesurent la <strong className="text-white">qualite d'une occasion de but</strong>. Pour chaque tir, un algorithme
          calcule la probabilite qu'il se transforme en but, basee sur des milliers de situations similaires dans le passe.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <h4 className="font-bold text-blue-400 mb-2">Exemple concret</h4>
          <p className="text-gray-300 text-sm">
            Un penalty a environ 0.76 xG (76% de chance d'etre marque). Un tir de 30 metres sans pression peut n'avoir que 0.02 xG.
            Un face-a-face avec le gardien peut valoir 0.35-0.50 xG selon l'angle et la distance.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">Facteurs pris en compte</h2>
        <p className="text-gray-300 mb-4">Les modeles xG considerent generalement :</p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span><strong className="text-white">Distance au but</strong> - plus on est loin, moins on a de chances</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span><strong className="text-white">Angle de tir</strong> - un angle ferme reduit les chances</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span><strong className="text-white">Partie du corps</strong> - pied fort, pied faible, tete</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span><strong className="text-white">Type d'action</strong> - contre-attaque, coup franc, penalty</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
            <span><strong className="text-white">Pression defensive</strong> - nombre de defenseurs entre le tireur et le but</span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">Comment interpreter les xG ?</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2">xG &gt; Buts marques</h4>
            <p className="text-gray-400 text-sm">
              L'equipe cree de bonnes occasions mais ne les convertit pas. Cela peut indiquer un manque de reussite
              ou un probleme de finition. Surveiller pour une potentielle amelioration.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2">xG &lt; Buts marques</h4>
            <p className="text-gray-400 text-sm">
              L'equipe surperforme par rapport a ses occasions. Cela peut indiquer un excellent finisseur,
              mais aussi une possible regression a venir.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">Les limites des xG</h2>
        <p className="text-gray-300 mb-4">
          Comme toute statistique, les xG ont leurs limites :
        </p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2 text-gray-300">
            <XCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
            <span>Ne prennent pas en compte la qualite individuelle du tireur</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <XCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
            <span>Ne considerent pas la forme du gardien adverse</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <XCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
            <span>Les modeles peuvent varier selon les fournisseurs de donnees</span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <XCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
            <span>Un petit echantillon peut etre trompeur</span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">Utilisation pratique</h2>
        <p className="text-gray-300 mb-4">
          Voici comment utiliser les xG dans vos analyses :
        </p>
        <ol className="space-y-3 mb-6 list-decimal list-inside">
          <li className="text-gray-300">
            <strong className="text-white">Comparez sur plusieurs matchs</strong> - Un seul match ne suffit pas, regardez la tendance sur 5-10 matchs minimum.
          </li>
          <li className="text-gray-300">
            <strong className="text-white">Croisez avec d'autres stats</strong> - Les xG seuls ne racontent pas toute l'histoire.
          </li>
          <li className="text-gray-300">
            <strong className="text-white">Utilisez les xG defensifs (xGA)</strong> - La qualite des occasions concedees est tout aussi importante.
          </li>
          <li className="text-gray-300">
            <strong className="text-white">Calculez la difference xG</strong> - xG - xGA vous donne une idee de la dominance reelle.
          </li>
        </ol>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-amber-400 mb-3">En Resume</h3>
          <p className="text-gray-300">
            Les Expected Goals sont un outil puissant pour aller au-dela des resultats bruts et comprendre la performance
            reelle d'une equipe. Utilises correctement, ils peuvent reveler des opportunites que le score final masque.
            Mais ils ne sont qu'un outil parmi d'autres - l'analyse complete necessite de croiser plusieurs sources de donnees.
          </p>
        </div>
      </div>
    ),
  },
};

// Related posts data
const relatedPostsData: Record<string, { slug: string; title: string; category: string }> = {
  'comment-analyser-match-football-guide-complet': {
    slug: 'comment-analyser-match-football-guide-complet',
    title: 'Comment Analyser un Match de Football : Guide Complet',
    category: 'Guides',
  },
  'top-5-erreurs-paris-sportifs': {
    slug: 'top-5-erreurs-paris-sportifs',
    title: 'Top 5 Erreurs a Eviter en Paris Sportifs',
    category: 'Guides',
  },
  'expected-goals-xg-comprendre-statistique-cle': {
    slug: 'expected-goals-xg-comprendre-statistique-cle',
    title: 'Expected Goals (xG) : Comprendre cette Statistique Cle',
    category: 'Guides',
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">Article non trouve</h1>
          <p className="text-gray-400 mb-6">L'article que vous recherchez n'existe pas ou a ete deplace.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const colors = categoryColors[post.category];
  const Icon = categoryIcons[post.category];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Disclaimer Banner */}
      <DisclaimerBanner variant="compact" />

      <div className="py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au blog
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-sm font-medium`}>
                <Icon className="w-4 h-4" />
                {post.category}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <p className="text-gray-400 text-lg mb-4">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} de lecture
              </span>
              <span className="text-gray-600">|</span>
              <span>Par {post.author.name}</span>
            </div>
          </motion.header>

          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            {post.content}
          </motion.article>

          {/* Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
          >
            <span className="text-gray-400 text-sm">Cet article vous a ete utile ?</span>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copie !');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </motion.div>

          {/* Related Posts */}
          {post.relatedPosts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-12"
            >
              <h2 className="text-lg font-bold text-white mb-4">Articles similaires</h2>
              <div className="space-y-3">
                {post.relatedPosts.map((relatedSlug) => {
                  const related = relatedPostsData[relatedSlug];
                  if (!related) return null;
                  const relatedColors = categoryColors[related.category as keyof typeof categoryColors];
                  return (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
                    >
                      <div>
                        <span className={`inline-block px-2 py-0.5 ${relatedColors?.bg || 'bg-gray-500/20'} ${relatedColors?.text || 'text-gray-400'} rounded text-xs font-medium mb-1`}>
                          {related.category}
                        </span>
                        <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">
                          {related.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl text-center"
          >
            <h3 className="text-lg font-bold text-white mb-2">Pret a voir nos analyses en action ?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Decouvrez nos pronostics gratuits bases sur l'intelligence artificielle
            </p>
            <Link
              href="/pronostics"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
            >
              <Target className="w-5 h-5" />
              Voir notre Track Record
            </Link>
          </motion.section>

          {/* Warning */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 text-sm">
                  <strong>Avertissement :</strong> Cet article est fourni a titre informatif et educatif uniquement.
                  Il ne constitue pas un conseil financier ni une incitation aux jeux d'argent.
                </p>
                <p className="text-red-200/60 text-xs mt-1">
                  Les jeux d'argent comportent des risques. Jouez responsablement. Appelez le <a href="tel:0974751313" className="underline">09 74 75 13 13</a>.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
