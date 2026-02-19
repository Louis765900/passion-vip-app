'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, Link2, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const SHARE_URLS = {
  twitter: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  whatsapp: (url: string, text: string) =>
    `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  telegram: (url: string, text: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
};

export function ShareButtons({ url, title, description, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : url;
  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: SHARE_URLS.twitter(fullUrl, shareText),
      color: 'hover:bg-sky-500 hover:text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: SHARE_URLS.facebook(fullUrl),
      color: 'hover:bg-blue-600 hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: SHARE_URLS.whatsapp(fullUrl, shareText),
      color: 'hover:bg-green-500 hover:text-white',
    },
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-slate-400 mr-2">
        <Share2 className="w-4 h-4 inline mr-1" />
        Partager :
      </span>
      
      {shareButtons.map((button) => (
        <a
          key={button.name}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'p-2 rounded-lg bg-slate-800/50 border border-slate-700',
            'text-slate-300 transition-all duration-200',
            'hover:scale-110 hover:border-transparent',
            button.color
          )}
          title={`Partager sur ${button.name}`}
        >
          <button.icon className="w-4 h-4" />
        </a>
      ))}

      <button
        onClick={handleCopyLink}
        className={cn(
          'p-2 rounded-lg border transition-all duration-200',
          'hover:scale-110',
          copied
            ? 'bg-green-500/20 border-green-500/50 text-green-400'
            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-amber-500/20 hover:text-amber-400'
        )}
        title="Copier le lien"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function SharePredictionCard({
  homeTeam,
  awayTeam,
  pick,
  odds,
}: {
  homeTeam: string;
  awayTeam: string;
  pick: string;
  odds: number;
}) {
  const [copied, setCopied] = useState(false);
  
  const shareText = `🏆 Pronostic PronoScope:\n${homeTeam} vs ${awayTeam}\n🎯 Pick: ${pick}\n💰 Cote: @${odds}\n\nRejoins-nous sur PronoScope`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <p className="text-sm text-slate-400 mb-3">Partager ce pronostic :</p>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all',
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
          )}
        >
          {copied ? 'Copié !' : 'Copier le texte'}
        </button>
      </div>
    </div>
  );
}
