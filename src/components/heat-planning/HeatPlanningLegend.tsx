import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeatPlanningLegendProps {
  onOpenTips: () => void;
}

export const HeatPlanningLegend: React.FC<HeatPlanningLegendProps> = ({ onOpenTips }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <div className="border-t pt-4 mt-6">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t('heatPlanner.legend.title')}
        </h4>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onOpenTips}
          className="gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Mating tips
        </Button>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="heatPredicted" className="cursor-default">
            10 feb
          </Badge>
          <span className="text-muted-foreground">
            {t('heatPlanner.legend.predicted')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="heatPlanned" className="cursor-default">
            20 jun
          </Badge>
          <span className="text-muted-foreground">
            {t('heatPlanner.legend.planned')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="heatConfirmed" className="cursor-default">
            15 jan
          </Badge>
          <span className="text-muted-foreground">
            {t('heatPlanner.legend.confirmed')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="heatOverdue" className="cursor-default">
            5 mar
          </Badge>
          <span className="text-muted-foreground">
            {t('heatPlanner.legend.overdue')}
          </span>
        </div>
      </div>
    </div>
  );
};
