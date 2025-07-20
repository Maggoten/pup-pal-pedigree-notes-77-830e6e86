
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { CarouselCard } from './CarouselCard';

interface FallbackTipCardProps {
  tip?: string;
  type?: 'tip' | 'offer' | 'info';
  tipKey?: 'weighPuppies' | 'registerLitter';
}

const tipIcons = {
  tip: Heart,
  offer: Heart,
  info: Heart
};

export const FallbackTipCard: React.FC<FallbackTipCardProps> = ({
  tip,
  type = 'tip',
  tipKey
}) => {
  const { t } = useTranslation('home');
  const Icon = tipIcons[type];

  // Use translation key if provided, otherwise use the passed tip text
  const displayTip = tipKey ? t(`tips.${tipKey}`) : tip;

  return (
    <CarouselCard className="p-6">
      <div className="flex flex-col items-center space-y-3 text-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">
          {displayTip}
        </p>
      </div>
    </CarouselCard>
  );
};

export const getRandomFallbackTips = (count: number = 3) => {
  const tipKeys: Array<{ tipKey: 'weighPuppies' | 'registerLitter'; type: 'tip' | 'info' }> = [
    { tipKey: 'weighPuppies', type: 'tip' },
    { tipKey: 'registerLitter', type: 'info' }
  ];

  return [...tipKeys].sort(() => Math.random() - 0.5).slice(0, count);
};
