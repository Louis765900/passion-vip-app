'use client';

import { useEffect, useState, useRef } from 'react';
import { Target, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { formatNumber, formatPercent } from '@/lib/utils/format';

interface StatsOverviewProps {
  stats?: {
    winRate: number;
    roi: number;
    totalAnalyses: number;
  };
}

function AnimatedCounter({ 
  value, 
  suffix = '', 
  duration = 2000 
}: { 
  value: number; 
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {formatNumber(count)}{suffix}
    </span>
  );
}

const statsConfig = [
  {
    key: 'winRate',
    label: 'Taux de réussite',
    icon: Target,
    color: 'amber',
    suffix: '%',
    format: (v: number) => formatPercent(v, 1),
  },
  {
    key: 'roi',
    label: 'ROI',
    icon: TrendingUp,
    color: 'green',
    suffix: '%',
    format: (v: number) => (v >= 0 ? '+' : '') + formatPercent(v, 1),
  },
  {
    key: 'totalAnalyses',
    label: 'Analyses réalisées',
    icon: BarChart3,
    color: 'violet',
    suffix: '',
    format: (v: number) => formatNumber(v),
  },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  const displayStats = stats || {
    winRate: 57.9,
    roi: 12.4,
    totalAnalyses: 250,
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            const value = displayStats[stat.key as keyof typeof displayStats];
            const isPositive = stat.key === 'roi' ? value >= 0 : true;

            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative p-8 rounded-2xl',
                  'bg-slate-800/50 backdrop-blur-sm',
                  'border border-slate-700/50',
                  'hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5',
                  'transition-all duration-300 group'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-6',
                    'transition-colors duration-300',
                    stat.color === 'amber' && 'bg-amber-500/10 group-hover:bg-amber-500/20',
                    stat.color === 'green' && 'bg-green-500/10 group-hover:bg-green-500/20',
                    stat.color === 'violet' && 'bg-violet-500/10 group-hover:bg-violet-500/20'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-7 h-7',
                      stat.color === 'amber' && 'text-amber-400',
                      stat.color === 'green' && isPositive ? 'text-green-400' : 'text-red-400',
                      stat.color === 'violet' && 'text-violet-400'
                    )}
                  />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span
                    className={cn(
                      'text-4xl sm:text-5xl font-bold',
                      stat.color === 'amber' && 'text-amber-400',
                      stat.color === 'green' && (isPositive ? 'text-green-400' : 'text-red-400'),
                      stat.color === 'violet' && 'text-violet-400'
                    )}
                  >
                    <AnimatedCounter value={value} suffix={stat.suffix} />
                  </span>
                </div>

                {/* Label */}
                <p className="text-slate-400 font-medium">{stat.label}</p>

                {/* Decoration */}
                <div
                  className={cn(
                    'absolute top-4 right-4 w-20 h-20 rounded-full blur-3xl opacity-20',
                    stat.color === 'amber' && 'bg-amber-500',
                    stat.color === 'green' && (isPositive ? 'bg-green-500' : 'bg-red-500'),
                    stat.color === 'violet' && 'bg-violet-500'
                  )}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
