import { Metadata } from 'next';
import { Heart, Sparkles, Users, Zap, Shield } from 'lucide-react';
import { DonationForm } from '@/components/donation/DonationForm';
import { DonorWall } from '@/components/donation/DonorWall';
import { OrganizationSchema } from '@/components/seo/StructuredData';
import { generateMetadata } from '@/lib/config/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Soutenir le Projet',
  description: 'Soutenez PronoScope et aidez-nous à maintenir une plateforme de pronostics football 100% gratuite et transparente.',
  keywords: ['don', 'soutien', 'contribution', 'pronostics football'],
  canonical: '/soutenir',
});

const benefits = [
  {
    icon: Zap,
    title: 'Serveurs Performants',
    description: 'Vos dons nous aident à maintenir des serveurs rapides et fiables pour des analyses en temps réel.',
  },
  {
    icon: Sparkles,
    title: 'IA Toujours Plus Futée',
    description: 'Amélioration continue de nos algorithmes d\'analyse prédictive.',
  },
  {
    icon: Users,
    title: 'Communauté Active',
    description: 'Développement de nouvelles fonctionnalités communautaires.',
  },
  {
    icon: Shield,
    title: '100% Indépendant',
    description: 'Aucun partenariat avec les bookmakers. Notre seule source de revenus, c\'est vous.',
  },
];

const faqs = [
  {
    question: 'Pourquoi faire un don ?',
    answer: 'PronoScope est 100% gratuit et sans publicité. Vos dons nous permettent de couvrir les coûts des serveurs, des APIs de données football et de continuer à développer de nouvelles fonctionnalités.',
  },
  {
    question: 'Comment mon don est-il utilisé ?',
    answer: 'Les dons servent exclusivement au fonctionnement et à l\'amélioration de la plateforme : serveurs, APIs de données, développement, et maintenance. Nous sommes transparents sur nos dépenses.',
  },
  {
    question: 'Puis-je déduire mon don des impôts ?',
    answer: 'Non, PronoScope n\'est pas une association à but non lucratif. Les dons sont des contributions volontaires sans contrepartie fiscale.',
  },
  {
    question: 'Mon don est-il sécurisé ?',
    answer: 'Absolument. Les paiements sont traités par Stripe, leader mondial des paiements en ligne. Nous ne stockons aucune information bancaire.',
  },
];

export default function SoutenirPage() {
  return (
    <>
      <OrganizationSchema />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Hero */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Soutenez le projet
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Votre générosité{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-300">
                fait vivre
              </span>{' '}
              le projet
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              PronoScope est 100% gratuit et le restera toujours. 
              Vos dons nous aident à maintenir et améliorer la plateforme.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Donation Form */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <h2 className="text-2xl font-bold text-white mb-2">Faire un don</h2>
                  <p className="text-slate-400 mb-6">
                    Choisissez le montant qui vous convient. Chaque euro compte !
                  </p>
                  <DonationForm />
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Pourquoi nous soutenir ?
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      Maintenir la gratuité totale
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      Améliorer nos algorithmes IA
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      Ajouter de nouvelles fonctionnalités
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      Rester indépendant des bookmakers
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                  <h3 className="font-semibold text-white mb-2">Sécurisé par Stripe</h3>
                  <p className="text-sm text-slate-400">
                    Paiement 100% sécurisé. Cartes acceptées : Visa, Mastercard, American Express.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donor Wall */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Mur des <span className="text-amber-400">Donateurs</span>
              </h2>
              <p className="text-slate-400">
                Merci à tous ceux qui nous soutiennent ❤️
              </p>
            </div>
            <DonorWall limit={15} />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-10">
              Questions <span className="text-amber-400">fréquentes</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50"
                >
                  <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
