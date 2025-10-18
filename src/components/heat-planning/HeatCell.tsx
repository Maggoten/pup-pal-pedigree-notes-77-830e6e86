import React from 'react';
import { HeatPrediction } from '@/types/heatPlanning';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { cn } from '@/lib/utils';
import { CheckCircle, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeatCellProps {
  prediction: HeatPrediction;
}

export const HeatCell: React.FC<HeatCellProps> = ({ prediction }) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const locale = i18n.language === 'sv' ? sv : enUS;
  
  // Status styling
  const statusConfig = {
    confirmed: {
      bg: 'bg-warmgreen-500',
      border: 'border-warmgreen-600',
      text: 'text-white',
      icon: CheckCircle,
      label: t('heatPlanner.status.confirmed'),
    },
    planned: {
      bg: 'bg-accent',
      border: 'border-accent',
      text: 'text-white',
      icon: Calendar,
      label: t('heatPlanner.status.planned'),
    },
    predicted: {
      bg: 'bg-warmbeige-400',
      border: 'border-warmbeige-500',
      text: 'text-foreground',
      icon: Clock,
      label: t('heatPlanner.status.predicted'),
    },
    overdue: {
      bg: 'bg-destructive',
      border: 'border-destructive',
      text: 'text-white',
      icon: AlertCircle,
      label: t('heatPlanner.status.overdue'),
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md',
              config.bg,
              config.border,
              config.text
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover border-border p-3 max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', config.text)} />
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
                <strong>{t('heatPlanner.tooltip.age')}:</strong> {prediction.ageAtHeat.toFixed(1)} {t('heatPlanner.tooltip.years')}
              </p>
              <p className="text-muted-foreground">
                <strong>{t('heatPlanner.tooltip.interval')}:</strong> ~{Math.round(prediction.interval / 30)} {t('heatPlanner.tooltip.months')} ({prediction.interval} {t('heatPlanner.tooltip.days')})
              </p>
              <p className="text-muted-foreground">
                <strong>{t('heatPlanner.tooltip.confidence')}:</strong> {t(`heatPlanner.confidence.${prediction.confidence}`)}
              </p>
              {prediction.hasPlannedLitter && (
                <p className="text-accent font-medium mt-2">
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
  );
};
