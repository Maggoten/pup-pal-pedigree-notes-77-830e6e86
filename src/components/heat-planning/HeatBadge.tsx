import React, { useState } from 'react';
import { HeatPrediction } from '@/types/heatPlanning';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { Circle, Heart, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { HeatActionDialog } from './HeatActionDialog';

interface HeatBadgeProps {
  prediction: HeatPrediction;
  onHeatConfirmed?: () => void;
}

export const HeatBadge: React.FC<HeatBadgeProps> = ({ prediction, onHeatConfirmed }) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const locale = i18n.language === 'sv' ? sv : enUS;
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const statusConfig = {
    confirmed: {
      className: 'bg-rose-500 text-white hover:bg-rose-600',
      icon: Circle,
      filled: true,
      label: t('heatPlanner.status.confirmed'),
    },
    planned: {
      className: 'bg-rose-600 text-white hover:bg-rose-700',
      icon: Heart,
      filled: true,
      label: t('heatPlanner.status.planned'),
    },
    predicted: {
      className: 'bg-pink-100 dark:bg-pink-950 text-pink-500 hover:bg-pink-200 dark:hover:bg-pink-900 border-2 border-pink-300 dark:border-pink-700',
      icon: Heart,
      filled: false,
      label: t('heatPlanner.status.predicted'),
    },
    overdue: {
      className: 'bg-amber-500 text-white hover:bg-amber-600',
      icon: AlertCircle,
      filled: true,
      label: t('heatPlanner.status.overdue'),
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;

  return (
    <>
      <Badge 
        onClick={() => setDialogOpen(true)}
        className={cn('gap-1.5 py-1.5 px-3 border-transparent cursor-pointer transition-transform hover:scale-105', config.className)}
      >
        {prediction.status === 'predicted' ? (
          <Heart 
            className="h-3 w-3" 
            fill="white" 
            stroke="rgb(244, 114, 182)"
            strokeWidth={2}
          />
        ) : config.filled ? (
          <Icon className="h-3 w-3" fill="currentColor" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {format(prediction.date, 'MMM', { locale })}
        </span>
      </Badge>

      <HeatActionDialog
        prediction={prediction}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onHeatConfirmed={onHeatConfirmed}
      />
    </>
  );
};
