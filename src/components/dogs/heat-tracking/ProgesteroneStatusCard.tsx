import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestTube, Heart, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { 
  type ProgesteroneStatus, 
  type ProgesteroneLevelKey,
  getUnitLabel 
} from '@/utils/progesteroneUnits';

interface ProgesteroneStatusCardProps {
  status: ProgesteroneStatus;
  lastTestDate: Date;
}

const LEVEL_COLORS: Record<ProgesteroneLevelKey, { bg: string; border: string; text: string; progress: string }> = {
  baseline: { 
    bg: 'bg-slate-50 dark:bg-slate-900/30', 
    border: 'border-slate-200 dark:border-slate-700', 
    text: 'text-slate-700 dark:text-slate-300',
    progress: 'bg-slate-400'
  },
  rising: { 
    bg: 'bg-blue-50 dark:bg-blue-900/30', 
    border: 'border-blue-200 dark:border-blue-700', 
    text: 'text-blue-700 dark:text-blue-300',
    progress: 'bg-blue-500'
  },
  ovulation: { 
    bg: 'bg-amber-50 dark:bg-amber-900/30', 
    border: 'border-amber-200 dark:border-amber-700', 
    text: 'text-amber-700 dark:text-amber-300',
    progress: 'bg-amber-500'
  },
  fertile: { 
    bg: 'bg-orange-50 dark:bg-orange-900/30', 
    border: 'border-orange-200 dark:border-orange-700', 
    text: 'text-orange-700 dark:text-orange-300',
    progress: 'bg-orange-500'
  },
  optimal: { 
    bg: 'bg-green-50 dark:bg-green-900/30', 
    border: 'border-green-200 dark:border-green-700', 
    text: 'text-green-700 dark:text-green-300',
    progress: 'bg-green-500'
  },
  urgent: { 
    bg: 'bg-red-50 dark:bg-red-900/30', 
    border: 'border-red-200 dark:border-red-700', 
    text: 'text-red-700 dark:text-red-300',
    progress: 'bg-red-500'
  }
};

// Calculate progress percentage (0-100) based on progesterone value
// Maps 0-20 ng/ml to 0-100%
function calculateProgress(valueInNg: number): number {
  const maxValue = 20;
  return Math.min(Math.round((valueInNg / maxValue) * 100), 100);
}

const ProgesteroneStatusCard: React.FC<ProgesteroneStatusCardProps> = ({ status, lastTestDate }) => {
  const { t } = useTranslation('dogs');
  const colors = LEVEL_COLORS[status.level];
  const unitLabel = getUnitLabel(status.unit);
  const progress = calculateProgress(status.valueInNg);

  const nextTestDate = status.config.retestDays 
    ? addDays(lastTestDate, status.config.retestDays)
    : null;

  const getUrgencyIcon = () => {
    switch (status.config.urgency) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Heart className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <TestTube className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Card className={`${colors.bg} ${colors.border} border-2`}>
      <CardContent className="p-4 space-y-3">
        {/* Header with level and value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getUrgencyIcon()}
            <span className={`font-semibold ${colors.text}`}>
              {t(`heatTracking.progesterone.levels.${status.level}.title`)}
            </span>
          </div>
          <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
            {status.displayValue.toFixed(1)} {unitLabel}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" indicatorClassName={colors.progress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{status.unit === 'nmol' ? '63.6 nmol/L' : '20 ng/ml'}</span>
          </div>
        </div>

        {/* Ovulation info */}
        <p className="text-sm text-muted-foreground">
          {t(`heatTracking.progesterone.levels.${status.level}.ovulation`)}
        </p>

        {/* Mating recommendation */}
        <div className={`p-2 rounded-md ${colors.bg} border ${colors.border}`}>
          <p className={`text-sm font-medium ${colors.text}`}>
            <Heart className="h-3.5 w-3.5 inline mr-1.5" />
            {t(`heatTracking.progesterone.levels.${status.level}.mating`)}
          </p>
        </div>

        {/* Next test date */}
        {nextTestDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t('heatTracking.progesterone.nextTest')}: {' '}
              <strong>{format(nextTestDate, 'MMM dd')}</strong>
              {' '}({status.config.retestDays} {t('heatTracking.progesterone.daysLabel')})
            </span>
          </div>
        )}

        {!nextTestDate && status.config.urgency !== 'low' && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Heart className="h-4 w-4" />
            <span className="font-medium">
              {t('heatTracking.progesterone.noRetestNeeded')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgesteroneStatusCard;
