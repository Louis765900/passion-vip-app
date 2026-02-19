'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Tag,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

// Types
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Guides' | 'Analyses' | 'Actualites';
  date: string;
  readTime: string;
  image?: string;
  featured?: boolean;
}

// Sample blog posts data (will be replaced with API data)
const blogPosts: BlogPost[] = [
  {
    slug: 'comment-analyser-match-football-guide-complet',
    title: 'Comment Analyser un Match de Football : Guide Complet 2026',
    excerpt: 'Decouvrez les techniques et statistiques essentielles pour analyser un match de football comme un professionnel. xG, possession, tirs cadres et bien plus.',
    category: 'Guides',
    date: '2026-01-28',
    readTime: '8 min',
    featured: true,
  },
  {
    slug: 'top-5-erreurs-paris-sportifs',
    title: 'Top 5 Erreurs a Eviter en Paris Sportifs',
    excerpt: 'Les erreurs les plus courantes des parieurs et comment les eviter pour ameliorer vos resultats sur le long terme.',
    category: 'Guides',
    date: '2026-01-25',
    readTime: '6 min',
  },
  {
    slug: 'expected-goals-xg-comprendre-statistique-cle',
    title: 'Expected Goals (xG) : Comprendre cette Statistique Cle',
    excerpt: 'Tout ce que vous devez savoir sur les Expected Goals, la statistique qui revolutionne l\'analyse du football moderne.',
    category: 'Guides',
    date: '2026-01-20',
    readTime: '10 min',
    featured: true,
  },
];

// Categories
const categories = [
  { value: 'all', label: 'Tous les articles', count: blogPosts.length },
  { value: 'Guides', label: 'Guides', count: blogPosts.filter(p => p.category === 'Guides').length },
  { value: 'Analyses', label: 'Analyses', count: blogPosts.filter(p => p.category === 'Analyses').length },
  { value: 'Actualites', label: 'Actualites', count: blogPosts.filter(p => p.category === 'Actualites').length },
];

// Category colors
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Guides: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Analyses: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Actualites: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
};

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
  Guides: BookOpen,
  Analyses: BarChart3,
  Actualites: TrendingUp,
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured posts
  const featuredPosts = blogPosts.filter(p => p.featured);

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'accueil
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Blog</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Guides, analyses et actualites pour ameliorer vos connaissances en paris sportifs.
            Contenu educatif gratuit et sans engagement.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
                <span className="ml-2 text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured Posts */}
        {selectedCategory === 'all' && searchQuery === '' && featuredPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Articles a la une
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredPosts.map((post, index) => {
                const colors = categoryColors[post.category];
                const Icon = categoryIcons[post.category];
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-all`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-medium`}>
                          <Icon className="w-3 h-3" />
                          {post.category}
                        </span>
                        <span className="text-amber-400 text-xs font-medium">A la une</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform">
                          Lire
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* All Posts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">
            {selectedCategory === 'all' ? 'Tous les articles' : `Articles : ${selectedCategory}`}
            <span className="text-gray-500 font-normal ml-2">({filteredPosts.length})</span>
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucun article trouve</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 text-amber-400 hover:underline"
              >
                Reinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => {
                const colors = categoryColors[post.category];
                const Icon = categoryIcons[post.category];
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <motion.article
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.07] transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-medium`}>
                              <Icon className="w-3 h-3" />
                              {post.category}
                            </span>
                          </div>
                          <h3 className="text-white font-bold mb-1 group-hover:text-amber-400 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Disclaimer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 text-sm">
                <strong>Rappel :</strong> Les articles de ce blog sont fournis a titre informatif et educatif.
                Ils ne constituent pas des conseils financiers ou une incitation aux jeux d'argent.
              </p>
              <p className="text-amber-200/60 text-xs mt-1">
                Jouer comporte des risques. Appelez le <a href="tel:0974751313" className="underline">09 74 75 13 13</a> en cas de besoin.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl text-center"
        >
          <h3 className="text-lg font-bold text-white mb-2">Envie de voir nos analyses en action ?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Decouvrez nos pronostics gratuits bases sur l'intelligence artificielle
          </p>
          <Link
            href="/pronostics"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Voir notre Track Record
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
