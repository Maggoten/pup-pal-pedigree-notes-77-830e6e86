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
import { cn } from '@/lib/utils';
import { CheckCircle, Calendar, AlertCircle, Clock } from 'lucide-react';

interface HeatCellProps {
  prediction: HeatPrediction;
}

export const HeatCell: React.FC<HeatCellProps> = ({ prediction }) => {
  // Status styling
  const statusConfig = {
    confirmed: {
      bg: 'bg-warmgreen-500',
      border: 'border-warmgreen-600',
      text: 'text-white',
      icon: CheckCircle,
      label: 'Bekräftat',
    },
    planned: {
      bg: 'bg-accent',
      border: 'border-accent',
      text: 'text-white',
      icon: Calendar,
      label: 'Planerad kull',
    },
    predicted: {
      bg: 'bg-warmbeige-400',
      border: 'border-warmbeige-500',
      text: 'text-foreground',
      icon: Clock,
      label: 'Förväntat',
    },
    overdue: {
      bg: 'bg-destructive',
      border: 'border-destructive',
      text: 'text-white',
      icon: AlertCircle,
      label: 'Försenat',
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;

  // Confidence styling
  const confidenceLabel = {
    high: 'Hög säkerhet',
    medium: 'Medel säkerhet',
    low: 'Låg säkerhet',
  };

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
                <strong>Datum:</strong> {format(prediction.date, 'PPP', { locale: sv })}
              </p>
              <p className="text-muted-foreground">
                <strong>Månad:</strong> {format(prediction.date, 'MMMM', { locale: sv })}
              </p>
              <p className="text-muted-foreground">
                <strong>Ålder:</strong> {prediction.ageAtHeat.toFixed(1)} år
              </p>
              <p className="text-muted-foreground">
                <strong>Intervall:</strong> ~{Math.round(prediction.interval / 30)} månader ({prediction.interval} dagar)
              </p>
              <p className="text-muted-foreground">
                <strong>Säkerhet:</strong> {confidenceLabel[prediction.confidence]}
              </p>
              {prediction.hasPlannedLitter && (
                <p className="text-accent font-medium mt-2">
                  Kopplad till planerad kull
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
