import React from 'react';
import { useTranslation } from 'react-i18next';
import heroImage from '@/assets/planned-litters-hero.jpg';

const PlannedLittersHero: React.FC = () => {
  const { t } = useTranslation('plannedLitters');

  return (
    <section className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="flex flex-col md:flex-row items-center">
        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold text-primary mb-2">
            {t('pages.plannedLitters.title')}
          </h1>
          <p className="text-lg text-primary/70 mb-4">
            Plan your future litters with ease
          </p>
          <p className="text-muted-foreground">
            {t('pages.plannedLitters.description')}
          </p>
        </div>
        
        {/* Hero Image */}
        <div className="flex-1 relative">
          <div className="aspect-video md:aspect-square overflow-hidden">
            <img 
              src={heroImage} 
              alt="Planned litters and breeding" 
              className="w-full h-full object-cover rounded-r-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlannedLittersHero;