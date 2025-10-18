import React from 'react';
import { HeatPrediction } from '@/types/heatPlanning';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CheckCircle, Calendar, AlertCircle, Clock } from 'lucide-react';

interface HeatBadgeProps {
  prediction: HeatPrediction;
}

export const HeatBadge: React.FC<HeatBadgeProps> = ({ prediction }) => {
  const statusConfig = {
    confirmed: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: 'Bekräftat',
    },
    planned: {
      variant: 'default' as const,
      icon: Calendar,
      label: 'Planerad',
    },
    predicted: {
      variant: 'secondary' as const,
      icon: Clock,
      label: 'Förväntat',
    },
    overdue: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      label: 'Försenat',
    },
  };

  const config = statusConfig[prediction.status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 py-1.5 px-3">
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">
        {format(prediction.date, 'MMM', { locale: sv })}
      </span>
      {prediction.hasPlannedLitter && (
        <Calendar className="h-3 w-3 ml-1" />
      )}
    </Badge>
  );
};
