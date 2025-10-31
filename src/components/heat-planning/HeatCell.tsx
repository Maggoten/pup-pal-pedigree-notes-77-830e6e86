import React, { useState } from 'react';
import { HeatPrediction } from '@/types/heatPlanning';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { Circle, Heart, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeatActionDialog } from './HeatActionDialog';
import { formatAge } from '@/utils/formatAge';

interface HeatCellProps {
  prediction: HeatPrediction;
  onHeatConfirmed?: () => void;
}

export const HeatCell: React.FC<HeatCellProps> = ({ prediction, onHeatConfirmed }) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const locale = i18n.language === 'sv' ? sv : enUS;
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Status styling with badge variants
  const statusConfig = {
    active: {
      variant: 'heatActive' as const,
      icon: Circle,
      label: t('heatPlanner.status.active'),
    },
    confirmed: {
      variant: 'heatConfirmed' as const,
      icon: Circle,
      label: t('heatPlanner.status.confirmed'),
    },
    planned: {
      variant: 'heatPlanned' as const,
      icon: Heart,
      label: t('heatPlanner.status.planned'),
    },
    mated: {
      variant: 'heatMated' as const,
      icon: Heart,
      label: t('heatPlanner.status.mated'),
    },
    predicted: {
      variant: 'heatPredicted' as const,
      icon: Heart,
      label: t('heatPlanner.status.predicted'),
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;
  
  // Format date as "5 Jan"
  const dateLabel = format(prediction.date, 'd MMM', { locale });

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={config.variant}
              onClick={() => setDialogOpen(true)}
              className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md font-medium text-xs px-2.5 py-1"
            >
              {dateLabel}
            </Badge>
          </TooltipTrigger>
           <TooltipContent className="bg-popover border-border p-3 max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="font-semibold text-foreground">{config.label}</span>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-foreground">
                  <strong>{t('heatPlanner.tooltip.date')}:</strong> {format(prediction.date, 'PPP', { locale })}
                </p>
                <p className="text-muted-foreground">
                  <strong>{t('heatPlanner.tooltip.month')}:</strong> {format(prediction.date, 'MMMM', { locale })}
                </p>
                <p className="text-muted-foreground">
                  <strong>{t('heatPlanner.tooltip.age')}:</strong> {formatAge(prediction.ageAtHeat)} {t('heatPlanner.tooltip.years')}
                </p>
                <p className="text-muted-foreground">
                  <strong>{t('heatPlanner.tooltip.interval')}:</strong> ~{Math.round(prediction.interval / 30)} {t('heatPlanner.tooltip.months')} ({prediction.interval} {t('heatPlanner.tooltip.days')})
                </p>
                {prediction.hasPlannedLitter && (
                  <p className="text-rose-600 font-medium mt-2">
                    {t('heatPlanner.tooltip.plannedMating')}
                  </p>
                )}
                {prediction.notes && (
                  <p className="text-muted-foreground text-xs mt-2 italic">
                    {prediction.notes}
                  </p>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <HeatActionDialog
        prediction={prediction}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onHeatConfirmed={onHeatConfirmed}
      />
    </>
  );
};
