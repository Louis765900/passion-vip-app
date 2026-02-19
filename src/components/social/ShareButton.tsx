'use client';

import { useState } from 'react';
import { Share2, Check, Twitter, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Match, PronosticResponse } from '@/types';

interface ShareButtonProps {
  match: Match;
  pronostic: PronosticResponse;
  ticketType: 'safe' | 'fun';
  className?: string;
}

export function ShareButton({ match, pronostic, ticketType, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const ticket = pronostic.vip_tickets[ticketType];
  const ticketLabel = ticketType === 'safe' ? 'SAFE' : 'FUN';
  const ticketEmoji = ticketType === 'safe' ? '🛡️' : '⚡';

  // SafeTicket has confidence, FunTicket has ev_value
  const confidenceText = 'confidence' in ticket 
    ? `📊 Confiance: ${ticket.confidence}%`
    : 'ev_value' in ticket && ticket.ev_value
      ? `📊 Value: +${ticket.ev_value}%`
      : '';

  const shareText = `${ticketEmoji} Ticket ${ticketLabel} - PronoScope

🏆 ${match.homeTeam} vs ${match.awayTeam}
🎯 ${ticket.market}: ${ticket.selection}
💰 Cote: @${ticket.odds_estimated}${confidenceText ? '\n' + confidenceText : ''}

Analyses IA gratuites sur PronoScope`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2.5 rounded-lg transition-all duration-200',
          'bg-slate-800 text-slate-300 border border-slate-700',
          'hover:bg-slate-700 hover:border-slate-600',
          'active:scale-95',
          isOpen && 'bg-amber-500/20 border-amber-500/50 text-amber-400',
          className
        )}
        title="Partager"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] p-3 rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
            <p className="text-xs text-slate-400 mb-3">Partager ce ticket :</p>
            
            <div className="space-y-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
                  'bg-sky-500/10 text-sky-400',
                  'hover:bg-sky-500/20',
                  'transition-colors text-sm'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>

              <button
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
                  copied 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                  'transition-colors text-sm'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copier le texte
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
