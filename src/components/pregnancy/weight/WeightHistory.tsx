import React, { useState } from 'react';
import { Scale, TrendingUp } from 'lucide-react';
import WeightItem from './WeightItem';
import { WeightRecord } from './types';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface WeightHistoryProps {
  weights: WeightRecord[];
  onDeleteWeight: (id: string) => void;
  limit?: number;
}

const WeightHistory: React.FC<WeightHistoryProps> = ({ 
  weights, 
  onDeleteWeight,
  limit = 10 
}) => {
  const { t } = useTranslation('pregnancy');
  const [showAll, setShowAll] = useState(false);
  
  const displayedWeights = showAll ? weights : weights.slice(0, limit);
  const hasMore = weights.length > limit;

  if (weights.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-sage-50/50 border border-dashed border-sage-200 rounded-lg">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-sage-100 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Scale className="h-8 w-8 text-sage-500" />
          </div>
          <div className="absolute -top-1 -right-1">
            <TrendingUp className="h-5 w-5 text-sage-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2">{t('weight.display.noWeights')}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t('weight.display.noWeightsDescription')}
        </p>
        
        <div className="mx-auto w-32 h-2 bg-sage-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-sage-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t('weight.display.historyTitle')}</h3>
      <div className="space-y-3">
        {displayedWeights.map((record) => (
          <WeightItem 
            key={record.id} 
            record={record} 
            onDelete={onDeleteWeight}
          />
        ))}
      </div>
      {hasMore && !showAll && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowAll(true)}
        >
          {t('health.showAll')} ({weights.length})
        </Button>
      )}
      {showAll && hasMore && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowAll(false)}
        >
          {t('health.showLess')}
        </Button>
      )}
    </div>
  );
};

export default WeightHistory;
