import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TestTube, Heart, Calendar, AlertTriangle, Clock, ChevronDown, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { 
  type ProgesteroneStatus, 
  type ProgesteroneLevelKey,
  getUnitLabel 
} from '@/utils/progesteroneUnits';
import type { OptimalMatingWindow } from '@/utils/progesteroneCalculator';

interface ProgesteroneStatusCardProps {
  status: ProgesteroneStatus;
  lastTestDate: Date;
  matingWindow?: OptimalMatingWindow;
}

// Badge colors for each progesterone level
const LEVEL_BADGE_COLORS: Record<ProgesteroneLevelKey, { bg: string; text: string; border: string }> = {
  baseline: { 
    bg: 'bg-slate-100 dark:bg-slate-800', 
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-600'
  },
  rising: { 
    bg: 'bg-blue-100 dark:bg-blue-900/50', 
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-500'
  },
  ovulation: { 
    bg: 'bg-amber-100 dark:bg-amber-900/50', 
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-500'
  },
  fertile: { 
    bg: 'bg-orange-100 dark:bg-orange-900/50', 
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-500'
  },
  optimal: { 
    bg: 'bg-green-100 dark:bg-green-900/50', 
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-400 dark:border-green-500'
  },
  urgent: { 
    bg: 'bg-red-100 dark:bg-red-900/50', 
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-500'
  }
};

// Progress bar colors for each level
const LEVEL_PROGRESS_COLORS: Record<ProgesteroneLevelKey, string> = {
  baseline: 'bg-slate-400',
  rising: 'bg-blue-500',
  ovulation: 'bg-amber-500',
  fertile: 'bg-orange-500',
  optimal: 'bg-green-500',
  urgent: 'bg-red-500'
};

// Consistent card background - matches the heat cycle card
const CARD_BG = 'bg-primary/5';

// Calculate progress percentage (0-100) based on progesterone value
// Maps 0-20 ng/ml to 0-100%
function calculateProgress(valueInNg: number): number {
  const maxValue = 20;
  return Math.min(Math.round((valueInNg / maxValue) * 100), 100);
}

const ProgesteroneStatusCard: React.FC<ProgesteroneStatusCardProps> = ({ status, lastTestDate, matingWindow }) => {
  const { t } = useTranslation('dogs');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const badgeColors = LEVEL_BADGE_COLORS[status.level];
  const progressColor = LEVEL_PROGRESS_COLORS[status.level];
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
    <Card className={`${CARD_BG} border border-primary/20`}>
      <CardContent className="p-4 space-y-3">
        {/* Prominent status badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${badgeColors.bg} ${badgeColors.border}`}>
          {getUrgencyIcon()}
          <span className={`font-semibold ${badgeColors.text}`}>
            {t(`heatTracking.progesterone.levels.${status.level}.title`)}
          </span>
        </div>

        {/* Value display */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('heatTracking.progesterone.currentLevel', { defaultValue: 'Current level' })}</span>
          <span className={`text-lg font-bold ${badgeColors.text}`}>
            {status.displayValue.toFixed(1)} {unitLabel}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" indicatorClassName={progressColor} />
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
        <div className={`p-2 rounded-md bg-primary/10 border border-primary/20`}>
          <p className="text-sm font-medium text-foreground">
            <Heart className="h-3.5 w-3.5 inline mr-1.5" />
            {t(`heatTracking.progesterone.levels.${status.level}.mating`)}
          </p>
        </div>

        {/* LH Surge Status - if matingWindow provided */}
        {matingWindow && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className={`h-4 w-4 ${matingWindow.lhSurgeDetected ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={matingWindow.lhSurgeDetected ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
              {matingWindow.lhSurgeDetected 
                ? t('heatTracking.mating.lhSurgeDetected', { defaultValue: 'LH surge detected' })
                : t('heatTracking.mating.lhSurgeNotDetected', { defaultValue: 'LH surge not detected' })
              }
            </span>
          </div>
        )}

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

        {/* Collapsible Level Guide */}
        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center pt-2 border-t">
            <span>ℹ️ {t('heatTracking.progesterone.levelGuide', { defaultValue: 'Level Guide' })}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isGuideOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-slate-400/50"></div>
                <span className="text-muted-foreground">{t('heatTracking.progesterone.levels.baseline.short')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-blue-500/50"></div>
                <span className="text-muted-foreground">{t('heatTracking.progesterone.levels.rising.short')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-amber-500/50"></div>
                <span className="text-muted-foreground">{t('heatTracking.progesterone.levels.ovulation.short')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-orange-500/50"></div>
                <span className="text-muted-foreground">{t('heatTracking.progesterone.levels.fertile.short')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-green-500/50"></div>
                <span className="text-muted-foreground">{t('heatTracking.progesterone.levels.optimal.short')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-red-500/50"></div>
                <span className="text-muted-foreground">{t('heatTracking.progesterone.levels.urgent.short')}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ProgesteroneStatusCard;
