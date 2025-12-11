import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LogTypeToggle from '../charts/LogTypeToggle';
import GrowthLineChart from '../charts/GrowthLineChart';
import useChartData from '../charts/useChartData';
import { Puppy } from '@/types/breeding';

interface ArchivedLitterStatisticsProps {
  statistics: {
    totalBorn: number;
    living: number;
    deceased: number;
    males: number;
    females: number;
    avgBirthWeight: number;
    avgWeightAt8Weeks: number;
  };
  puppies: Puppy[];
  litterDateOfBirth: string;
}

const ArchivedLitterStatistics: React.FC<ArchivedLitterStatisticsProps> = ({ 
  statistics, 
  puppies,
  litterDateOfBirth
}) => {
  const { t } = useTranslation('litters');
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');

  // Use the same chart data hook as active litters for individual puppy lines
  const { chartData, chartConfig, noDataAvailable } = useChartData(
    puppies,
    null, // No selected puppy - show all
    'litter', // Always litter view for archived
    logType,
    litterDateOfBirth
  );

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('archivedLitters.summary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="h-4 w-4" />
                {t('archivedLitters.summary.totalBorn')}
              </div>
              <p className="text-2xl font-bold text-primary">{statistics.totalBorn}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Activity className="h-4 w-4" />
                {t('archivedLitters.summary.living')}
              </div>
              <p className="text-2xl font-bold text-green-600">{statistics.living}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">
                {t('archivedLitters.summary.males')}
              </div>
              <p className="text-2xl font-bold text-blue-600">{statistics.males}</p>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">
                {t('archivedLitters.summary.females')}
              </div>
              <p className="text-2xl font-bold text-pink-600">{statistics.females}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('archivedLitters.statistics.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                {t('archivedLitters.statistics.avgBirthWeight')}
              </p>
              <p className="text-xl font-semibold">
                {statistics.avgBirthWeight.toFixed(3)} kg
              </p>
            </div>

            <div className="bg-secondary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                {t('archivedLitters.statistics.avgWeightAt8Weeks')}
              </p>
              <p className="text-xl font-semibold">
                {statistics.avgWeightAt8Weeks > 0 
                  ? `${statistics.avgWeightAt8Weeks.toFixed(3)} kg`
                  : t('archivedLitters.statistics.noData')
                }
              </p>
            </div>
          </div>

          {/* Growth Chart with Individual Puppy Lines */}
          {puppies.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">
                  {t('archivedLitters.statistics.litterGrowthChart')}
                </h4>
                <LogTypeToggle logType={logType} setLogType={setLogType} />
              </div>
              {!noDataAvailable ? (
                <GrowthLineChart
                  chartData={chartData}
                  chartConfig={chartConfig}
                  logType={logType}
                  viewMode="litter"
                  selectedPuppy={null}
                  puppies={puppies}
                  litterDateOfBirth={litterDateOfBirth}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('archivedLitters.statistics.noDataAvailable')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchivedLitterStatistics;
