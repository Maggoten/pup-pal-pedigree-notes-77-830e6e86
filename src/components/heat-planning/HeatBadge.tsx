import React from 'react';
import { HeatPrediction } from '@/types/heatPlanning';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { Circle, Heart, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HeatBadgeProps {
  prediction: HeatPrediction;
}

export const HeatBadge: React.FC<HeatBadgeProps> = ({ prediction }) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const locale = i18n.language === 'sv' ? sv : enUS;
  
  const statusConfig = {
    confirmed: {
      className: 'bg-rose-500 text-white hover:bg-rose-600',
      icon: Circle,
      filled: true,
      label: t('heatPlanner.status.confirmed'),
    },
    planned: {
      className: 'bg-emerald-500 text-white hover:bg-emerald-600',
      icon: Heart,
      filled: true,
      label: t('heatPlanner.status.planned'),
    },
    predicted: {
      className: 'bg-white dark:bg-background text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 border-2 border-pink-400',
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
    <Badge className={cn('gap-1.5 py-1.5 px-3 border-transparent', config.className)}>
      {config.filled ? (
        <Icon className="h-3 w-3" fill="currentColor" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      <span className="text-xs font-medium">
        {format(prediction.date, 'MMM', { locale })}
      </span>
    </Badge>
  );
};
