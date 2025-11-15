import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ArchivedLitterStatisticsProps {
  statistics: {
    totalBorn: number;
    living: number;
    deceased: number;
    males: number;
    females: number;
    avgBirthWeight: number;
    avgFinalWeight: number;
  };
  averageWeightLog: Array<{ date: string; weight: number }>;
  averageHeightLog: Array<{ date: string; height: number }>;
}

const ArchivedLitterStatistics: React.FC<ArchivedLitterStatisticsProps> = ({ 
  statistics, 
  averageWeightLog,
  averageHeightLog 
}) => {
  const { t } = useTranslation('litters');

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
                {t('archivedLitters.statistics.avgFinalWeight')}
              </p>
              <p className="text-xl font-semibold">
                {statistics.avgFinalWeight.toFixed(3)} kg
              </p>
            </div>
          </div>

          {/* Weight Chart */}
          {averageWeightLog.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4">
                {t('archivedLitters.statistics.litterGrowthChart')}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={averageWeightLog}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toFixed(3)} kg`, t('puppies.labels.weight')]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name={t('puppies.labels.averageWeight')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchivedLitterStatistics;
