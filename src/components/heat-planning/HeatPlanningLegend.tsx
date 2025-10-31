import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export const HeatPlanningLegend: React.FC = () => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <div className="border-t pt-4 mt-6">
      <h4 className="text-sm font-medium mb-3 text-muted-foreground">
        {t('heatPlanner.legend.title')}
      </h4>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="heatActive" className="cursor-default">
            5 mar
          </Badge>
          <span className="text-muted-foreground">
            {t('heatPlanner.legend.active')}
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
          <Badge variant="heatPredicted" className="cursor-default">
            10 feb
          </Badge>
          <span className="text-muted-foreground">
            {t('heatPlanner.legend.predicted')}
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
      </div>
    </div>
  );
};
