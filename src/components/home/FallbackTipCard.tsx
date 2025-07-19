import React from 'react';
import { Heart } from 'lucide-react';
import { CarouselCard } from './CarouselCard';

interface FallbackTipCardProps {
  tip: string;
  type?: 'tip' | 'offer' | 'info';
}

const tipIcons = {
  tip: Heart,
  offer: Heart,
  info: Heart
};

const tips = [
  { text: "Weigh your puppies daily during the first week to ensure healthy growth.", type: "tip" as const },
  { text: "Remember to register your litter with the kennel club.", type: "info" as const }
];

export const FallbackTipCard: React.FC<FallbackTipCardProps> = ({
  tip,
  type = 'tip'
}) => {
  const Icon = tipIcons[type];

  return (
    <CarouselCard className="p-6">
      <div className="flex flex-col items-center space-y-3 text-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">
          {tip}
        </p>
      </div>
    </CarouselCard>
  );
};

export const getRandomFallbackTips = (count: number = 3) => {
  return [...tips].sort(() => Math.random() - 0.5).slice(0, count);
};