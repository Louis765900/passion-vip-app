'use client';

import CookieConsent from 'react-cookie-consent';
import Link from 'next/link';
import { Cookie, Settings } from 'lucide-react';

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accepter"
      declineButtonText="Refuser"
      enableDeclineButton
      cookieName="cookie_consent_rgpd"
      expires={365}
      style={{
        background: 'rgba(17, 24, 39, 0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 24px',
        alignItems: 'center',
        gap: '16px',
      }}
      contentStyle={{
        flex: '1 1 auto',
        margin: 0,
      }}
      buttonStyle={{
        background: 'linear-gradient(to right, #F59E0B, #D97706)',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '14px',
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
        fontSize: '14px',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginRight: '8px',
      }}
      onAccept={() => {
        // Activer les analytics si necessaire
        console.log('Cookies accepted');
      }}
      onDecline={() => {
        // Desactiver les cookies non-essentiels
        console.log('Cookies declined');
      }}
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20 flex-shrink-0">
          <Cookie className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-2">
          <p className="text-white text-sm font-medium">
            Ce site utilise des cookies
          </p>
          <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
            Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies analytiques
            pour ameliorer votre experience. Vous pouvez accepter ou refuser les cookies non-essentiels.
            Pour plus d'informations, consultez notre{' '}
            <Link href="/confidentialite" className="text-amber-400 hover:underline">
              Politique de Confidentialite
            </Link>.
          </p>
        </div>
      </div>
    </CookieConsent>
  );
}

export default CookieBanner;
