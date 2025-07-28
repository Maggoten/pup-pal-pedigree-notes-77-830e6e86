
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dog, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyPlannedLittersProps {
  onAddClick: () => void;
}

const EmptyPlannedLitters: React.FC<EmptyPlannedLittersProps> = ({ onAddClick }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg text-center py-12 px-6 bg-primary/5">
      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <div className="relative">
          <Dog className="h-10 w-10 text-primary opacity-80" />
          <Heart className="h-5 w-5 text-accent absolute -top-1 -right-2 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-medium mt-4 mb-2">{t('empty.plannedLitters.title')}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {t('empty.plannedLitters.description')}
      </p>
      <Button onClick={onAddClick} size="lg" className="bg-primary hover:bg-primary/90">
        {t('actions.addFirstPlannedLitter')}
      </Button>
      
      {/* Decorative elements */}
      <div className="mt-8 flex justify-center space-x-4 opacity-30">
        <div className="w-4 h-4 rounded-full bg-sage-300"></div>
        <div className="w-4 h-4 rounded-full bg-sage-400"></div>
        <div className="w-4 h-4 rounded-full bg-sage-500"></div>
        <div className="w-4 h-4 rounded-full bg-sage-400"></div>
        <div className="w-4 h-4 rounded-full bg-sage-300"></div>
      </div>
    </div>
  );
};

export default EmptyPlannedLitters;
