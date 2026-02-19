/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://pronoscope.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/dashboard*', '/admin*', '/mes-paris*', '/stats*', '/api/*'],
  additionalPaths: async (config) => {
    // Manually add public pages since they're all dynamic in Next.js App Router
    const publicPages = [
      '/',
      '/a-propos',
      '/pronostics',
      '/vip',
      '/join',
      '/login',
      '/mentions-legales',
      '/cgu',
      '/confidentialite',
      '/jeu-responsable',
      '/blog',
    ];

    return publicPages.map((path) => ({
      loc: path,
      changefreq: path === '/' || path === '/pronostics' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : path === '/pronostics' ? 0.9 : 0.7,
      lastmod: new Date().toISOString(),
    }));
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/dashboard' },
      { userAgent: '*', disallow: '/admin' },
      { userAgent: '*', disallow: '/mes-paris' },
      { userAgent: '*', disallow: '/api' },
    ],
  },
}
