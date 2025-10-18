import React from 'react';
import { HeatPrediction } from '@/types/heatPlanning';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { CheckCircle, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeatBadgeProps {
  prediction: HeatPrediction;
}

export const HeatBadge: React.FC<HeatBadgeProps> = ({ prediction }) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const locale = i18n.language === 'sv' ? sv : enUS;
  
  const statusConfig = {
    confirmed: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: t('heatPlanner.status.confirmed'),
    },
    planned: {
      variant: 'default' as const,
      icon: Calendar,
      label: t('heatPlanner.status.planned'),
    },
    predicted: {
      variant: 'secondary' as const,
      icon: Clock,
      label: t('heatPlanner.status.predicted'),
    },
    overdue: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      label: t('heatPlanner.status.overdue'),
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 py-1.5 px-3">
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">
        {format(prediction.date, 'MMM', { locale })}
      </span>
      {prediction.hasPlannedLitter && (
        <Calendar className="h-3 w-3 ml-1" />
      )}
    </Badge>
  );
};
