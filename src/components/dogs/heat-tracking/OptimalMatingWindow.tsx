import React from 'react';
import { format, isToday, isTomorrow, isPast, isAfter, isBefore } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Calendar, AlertTriangle, CheckCircle, Clock, TestTube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OptimalMatingWindow } from '@/utils/progesteroneCalculator';
import { getStoredUnit, formatProgesteroneValue } from '@/utils/progesteroneUnits';

interface OptimalMatingWindowProps {
  matingWindow: OptimalMatingWindow;
  nextTestDate?: Date | null;
}

const OptimalMatingWindowComponent: React.FC<OptimalMatingWindowProps> = ({ 
  matingWindow, 
  nextTestDate 
}) => {
  const { t } = useTranslation('dogs');
  const unit = getStoredUnit();

  const getConfidenceBadge = (confidence: OptimalMatingWindow['confidence']) => {
    const variants = {
      high: { variant: 'default' as const, color: 'bg-green-500', icon: CheckCircle },
      medium: { variant: 'secondary' as const, color: 'bg-yellow-500', icon: Clock },
      low: { variant: 'outline' as const, color: 'bg-orange-500', icon: AlertTriangle },
      insufficient_data: { variant: 'destructive' as const, color: 'bg-red-500', icon: TestTube }
    };

    const config = variants[confidence];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t(`heatTracking.mating.confidence.${confidence}`, { 
          defaultValue: confidence.replace('_', ' ') 
        })}
      </Badge>
    );
  };

  const getWindowStatus = () => {
    if (!matingWindow.startDate || !matingWindow.endDate) {
      return { status: 'pending', color: 'text-muted-foreground' };
    }

    const now = new Date();
    
    if (isBefore(now, matingWindow.startDate)) {
      return { status: 'upcoming', color: 'text-blue-600' };
    } else if (isAfter(now, matingWindow.endDate)) {
      return { status: 'past', color: 'text-muted-foreground' };
    } else {
      return { status: 'active', color: 'text-green-600' };
    }
  };

  const windowStatus = getWindowStatus();

  const formatTimeWindow = () => {
    if (!matingWindow.startDate || !matingWindow.endDate) {
      return t('heatTracking.mating.windowNotDetermined', { defaultValue: 'Window not yet determined' });
    }

    const startFormatted = format(matingWindow.startDate, 'MMM dd, HH:mm');
    const endFormatted = format(matingWindow.endDate, 'MMM dd, HH:mm');
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5" />
              {t('heatTracking.mating.optimalWindow', { defaultValue: 'Optimal Mating Window' })}
            </CardTitle>
            {getConfidenceBadge(matingWindow.confidence)}
          </div>
          <CardDescription>
            {t('heatTracking.mating.windowDescription', { 
              defaultValue: 'Based on progesterone levels and LH surge detection' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Window Timing */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={`font-medium ${windowStatus.color}`}>
              {formatTimeWindow()}
            </span>
          </div>

          {/* LH Surge Status */}
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-muted-foreground" />
            <span>
              {matingWindow.lhSurgeDetected ? (
                <span className="text-green-600">
                  {t('heatTracking.mating.lhSurgeDetected', { defaultValue: 'LH surge detected' })}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {t('heatTracking.mating.lhSurgeNotDetected', { defaultValue: 'LH surge not yet detected' })}
                </span>
              )}
            </span>
          </div>

          {/* Peak Progesterone Value - display in user's preferred unit */}
          {matingWindow.peakProgesteroneValue && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('heatTracking.mating.peakProgesterone', { defaultValue: 'Peak progesterone' })}:
              </span>
              <Badge variant="outline">
                {formatProgesteroneValue(matingWindow.peakProgesteroneValue, unit)}
              </Badge>
            </div>
          )}

          {/* Status Alert */}
          {windowStatus.status === 'active' && matingWindow.startDate && matingWindow.endDate && (
            <Alert className="border-green-200 bg-green-50">
              <Heart className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t('heatTracking.mating.activeWindow', { 
                  defaultValue: 'Optimal mating window is NOW! This is the peak fertility period.' 
                })}
              </AlertDescription>
            </Alert>
          )}

          {windowStatus.status === 'upcoming' && matingWindow.startDate && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {isToday(matingWindow.startDate) 
                  ? t('heatTracking.mating.windowToday', { defaultValue: 'Optimal window starts today' })
                  : isTomorrow(matingWindow.startDate)
                  ? t('heatTracking.mating.windowTomorrow', { defaultValue: 'Optimal window starts tomorrow' })
                  : t('heatTracking.mating.windowUpcoming', { defaultValue: 'Optimal window starting soon' })
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Next Test Recommendation */}
          {nextTestDate && (
            <Alert>
              <TestTube className="h-4 w-4" />
              <AlertDescription>
                {t('heatTracking.mating.nextTest', { defaultValue: 'Next progesterone test recommended' })}: {' '}
                <strong>
                  {isToday(nextTestDate) 
                    ? t('heatTracking.mating.testToday', { defaultValue: 'Today' })
                    : format(nextTestDate, 'MMM dd, HH:mm')
                  }
                </strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {matingWindow.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('heatTracking.mating.recommendations', { defaultValue: 'Recommendations' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {matingWindow.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t(`heatTracking.mating.recommendationTexts.${recommendation}`, { defaultValue: recommendation })}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimalMatingWindowComponent;