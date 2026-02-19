'use client';

import { useState } from 'react';
import { Heart, MessageSquare, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DonationTiers } from './DonationTiers';

export function DonationForm() {
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1) {
      setAmount(numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          message: message.trim() || undefined,
          isAnonymous,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId) {
        // Fallback: redirect to Stripe with session ID
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else {
        throw new Error('URL de paiement non disponible');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du paiement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-4">
          Choisissez votre contribution
        </label>
        <DonationTiers selectedAmount={amount} onSelectAmount={setAmount} />
      </div>

      {/* Custom Amount */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Ou montant personnalisé
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="1000"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="Entrez un montant..."
            className={cn(
              'w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600',
              'text-white placeholder-slate-500',
              'focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
              'transition-all'
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Message (optionnel)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          placeholder="Un message d'encouragement..."
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600',
            'text-white placeholder-slate-500 resize-none',
            'focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
            'transition-all'
          )}
          rows={3}
        />
        <p className="text-xs text-slate-500 mt-1">{message.length}/200 caractères</p>
      </div>

      {/* Anonymous Option */}
      <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/20"
        />
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">
            Faire un don anonyme (votre nom n'apparaîtra pas sur le mur)
          </span>
        </div>
      </label>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || amount < 1}
        className={cn(
          'w-full py-4 px-6 rounded-xl font-bold text-lg',
          'bg-gradient-to-r from-amber-500 to-amber-600 text-black',
          'flex items-center justify-center gap-2',
          'hover:from-amber-400 hover:to-amber-500',
          'active:scale-[0.98]',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Sparkles className="w-5 h-5 animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" />
            Faire un don de {amount}€
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Paiement sécurisé par Stripe. Aucune donnée bancaire n'est stockée sur nos serveurs.
      </p>
    </form>
  );
}
