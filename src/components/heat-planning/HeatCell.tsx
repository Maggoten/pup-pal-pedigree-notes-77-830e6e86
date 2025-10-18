import React, { useState } from 'react';
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
  
  // Status styling with new color scheme
  const statusConfig = {
    confirmed: {
      bg: 'bg-rose-500',
      border: 'border-rose-600',
      text: 'text-white',
      icon: Circle,
      filled: true,
      label: t('heatPlanner.status.confirmed'),
    },
    planned: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-600',
      text: 'text-white',
      icon: Heart,
      filled: true,
      label: t('heatPlanner.status.planned'),
    },
    predicted: {
      bg: 'bg-pink-200',
      border: 'border-pink-300',
      text: 'text-foreground',
      icon: Circle,
      filled: false,
      label: t('heatPlanner.status.predicted'),
    },
    overdue: {
      bg: 'bg-amber-500',
      border: 'border-amber-600',
      text: 'text-white',
      icon: AlertCircle,
      filled: true,
      label: t('heatPlanner.status.overdue'),
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => setDialogOpen(true)}
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md',
                config.filled ? config.bg : 'bg-white dark:bg-background',
                config.border,
                config.text
              )}
            >
              {config.filled ? (
                <Icon className="h-4 w-4" fill="currentColor" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
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
                  <strong>{t('heatPlanner.tooltip.age')}:</strong> {formatAge(prediction.ageAtHeat)} {t('heatPlanner.tooltip.years')}
                </p>
                <p className="text-muted-foreground">
                  <strong>{t('heatPlanner.tooltip.interval')}:</strong> ~{Math.round(prediction.interval / 30)} {t('heatPlanner.tooltip.months')} ({prediction.interval} {t('heatPlanner.tooltip.days')})
                </p>
                <p className="text-muted-foreground">
                  <strong>{t('heatPlanner.tooltip.confidence')}:</strong> {t(`heatPlanner.confidence.${prediction.confidence}`)}
                </p>
                {prediction.hasPlannedLitter && (
                  <p className="text-emerald-600 font-medium mt-2">
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
