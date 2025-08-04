
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyLitterStateProps {
  onAddLitter: () => void;
}

const EmptyLitterState: React.FC<EmptyLitterStateProps> = ({ onAddLitter }) => {
  const { t } = useTranslation('litters');
  
  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="text-center py-12 px-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <PawPrint className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">{t('empty.myLitters.title')}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t('empty.myLitters.description')}
        </p>
        <div className="relative">
          <Button 
            onClick={onAddLitter} 
            size="lg"
            className="bg-primary hover:bg-primary/90 relative z-10"
          >
            {t('actions.addFirstLitter')}
          </Button>
          {/* Decorative paw prints */}
          <div className="absolute -top-6 -left-8 opacity-10">
            <PawPrint className="h-5 w-5 transform rotate-[-20deg]" />
          </div>
          <div className="absolute -bottom-6 -right-8 opacity-10">
            <PawPrint className="h-5 w-5 transform rotate-[20deg]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyLitterState;
