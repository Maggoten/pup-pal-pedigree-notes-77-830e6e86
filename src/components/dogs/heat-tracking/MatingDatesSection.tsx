import React from 'react';
import { Heart, Thermometer, TestTube, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { getStoredUnit, formatProgesteroneValue } from '@/utils/progesteroneUnits';

interface MatingDate {
  id: string;
  mating_date: string;
  pregnancy_id: string | null;
}

interface HeatLog {
  id: string;
  date: string;
  temperature: number | null;
  progesterone_value: number | null;
  test_type: string | null;
}

interface MatingDatesSectionProps {
  matingDates: MatingDate[];
  heatLogs: HeatLog[];
  cycleStartDate: string;
}

const MatingDatesSection: React.FC<MatingDatesSectionProps> = ({
  matingDates,
  heatLogs,
  cycleStartDate
}) => {
  const { t } = useTranslation('dogs');
  const unit = getStoredUnit();

  if (!matingDates || matingDates.length === 0) {
    return null;
  }

  const startDate = parseISODate(cycleStartDate);

  // Find closest heat log to a given date for temp/progesterone
  const findClosestLog = (targetDate: Date): HeatLog | null => {
    if (!heatLogs || heatLogs.length === 0) return null;

    let closest: HeatLog | null = null;
    let minDiff = Infinity;

    for (const log of heatLogs) {
      const logDate = parseISODate(log.date);
      const diff = Math.abs(differenceInDays(logDate, targetDate));
      
      // Only consider logs within 2 days of mating
      if (diff <= 2 && diff < minDiff) {
        minDiff = diff;
        closest = log;
      }
    }

    return closest;
  };

  return (
    <div className="border rounded-lg p-4 bg-pink-50/50 border-pink-200">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-4 w-4 text-pink-600" />
        <h4 className="font-medium text-sm text-pink-800">
          {t('heatTracking.matingDates.title', 'Parningsdatum')}
        </h4>
        <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-xs">
          {matingDates.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {matingDates.map((mating, index) => {
          const matingDate = parseISODate(mating.mating_date);
          const dayInCycle = differenceInDays(matingDate, startDate) + 1;
          const closestLog = findClosestLog(matingDate);

          return (
            <div 
              key={mating.id} 
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 bg-white rounded-md border border-pink-100"
            >
              {/* Date and Day in Cycle */}
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" />
                <span className="font-medium text-sm">
                  {format(matingDate, 'dd MMM yyyy')}
                </span>
                <Badge variant="outline" className="text-xs border-pink-300 text-pink-700">
                  {t('heatTracking.matingDates.dayInCycle', 'Dag {{day}}', { day: dayInCycle })}
                </Badge>
              </div>

              {/* Temperature and Progesterone from closest log */}
              {closestLog && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {closestLog.test_type === 'temperature' && closestLog.temperature && (
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      {closestLog.temperature}°C
                    </span>
                  )}
                  {closestLog.test_type === 'progesterone' && closestLog.progesterone_value && (
                    <span className="flex items-center gap-1">
                      <TestTube className="h-3 w-3" />
                      {formatProgesteroneValue(closestLog.progesterone_value, unit)}
                    </span>
                  )}
                </div>
              )}

              {/* Pregnancy indicator */}
              {mating.pregnancy_id && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 ml-auto">
                  {t('heatTracking.matingDates.linkedToPregnancy', 'Kopplad till dräktighet')}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatingDatesSection;
