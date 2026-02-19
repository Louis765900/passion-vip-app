import { Metadata } from 'next';
import { generateMetadata } from '@/lib/config/seo';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/StructuredData';
import { HeroSection } from '@/components/marketing/Hero';
import { HeroImages } from '@/components/marketing/HeroImages';
import { FeatureImages } from '@/components/marketing/FeatureImages';
import { StatsOverview } from '@/components/marketing/StatsOverview';
import { TrustSection } from '@/components/marketing/TrustBadges';
import { TestimonialsSection } from '@/components/marketing/Testimonials';
import { NewsletterSection } from '@/components/marketing/Newsletter';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { HowItWorksSection } from '@/components/marketing/HowItWorks';
import { RecentResults } from '@/components/marketing/RecentResults';
import { FinalCTA } from '@/components/marketing/FinalCTA';

export const metadata: Metadata = generateMetadata({
  title: 'Pronostics Football IA Gratuits',
  description: 'Pronostics football IA gratuits et transparents. Analyses basées sur les données, pas sur l\'intuition. 57.9% de réussite, +12.4% ROI.',
  keywords: ['pronostic foot', 'analyse IA football', 'pronostic gratuit'],
  canonical: '/',
});

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      
      <div className="min-h-screen bg-slate-950">
        {/* 1. HERO */}
        <HeroSection />
        
        {/* HERO IMAGES - Interface preview */}
        <HeroImages />
        
        {/* Disclaimer */}
        <DisclaimerBanner />
        
        {/* 2. STATS GLOBALES */}
        <StatsOverview 
          stats={{
            winRate: 57.9,
            roi: 12.4,
            totalAnalyses: 250,
          }}
        />
        
        {/* FEATURE IMAGES */}
        <FeatureImages />
        
        {/* 3. COMMENT FONCTIONNE L'IA */}
        <HowItWorksSection />
        
        {/* 4. DERNIERS RÉSULTATS */}
        <RecentResults />
        
        {/* 5. POURQUOI NOUS FAIRE CONFIANCE */}
        <TrustSection />
        
        {/* 6. TÉMOIGNAGES */}
        <TestimonialsSection />
        
        {/* 7. NEWSLETTER */}
        <NewsletterSection />
        
        {/* 8. CTA FINAL */}
        <FinalCTA />
      </div>
    </>
  );
}
