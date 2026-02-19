'use client';

import { useState } from 'react';
import { Mail, Sparkles, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setIsSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-violet-500/5" />
      
      <div className="relative max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Newsletter
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Recevez nos <span className="text-amber-400">meilleurs pronostics</span>
            </h2>
            
            <p className="text-slate-400 max-w-lg mx-auto">
              Inscrivez-vous pour recevoir nos analyses quotidiennes directement dans votre boîte mail. 
              Sans spam, désinscription facile.
            </p>
          </div>

          {isSuccess ? (
            <div className="max-w-md mx-auto p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Inscription réussie !</h3>
              <p className="text-slate-400">
                Merci pour votre confiance. Vous recevrez bientôt nos premières analyses.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className={cn(
                    'w-full pl-12 pr-4 py-4 rounded-xl',
                    'bg-slate-900 border border-slate-600',
                    'text-white placeholder-slate-500',
                    'focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
                    'transition-all'
                  )}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-4 px-6 rounded-xl font-bold',
                  'bg-gradient-to-r from-amber-500 to-amber-600 text-black',
                  'hover:from-amber-400 hover:to-amber-500',
                  'active:scale-[0.98]',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2'
                )}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  'S\'inscrire gratuitement'
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                En vous inscrivant, vous acceptez de recevoir nos emails. 
                Vous pouvez vous désinscrire à tout moment.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
