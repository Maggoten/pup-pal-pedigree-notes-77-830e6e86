import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export interface WeightLog {
  id: string;
  date: Date;
  weight: number;
  notes?: string;
}

interface ArchivedWeightCurveProps {
  weightLogs: WeightLog[];
}

const findHighestWeight = (logs: WeightLog[]): WeightLog | null => {
  if (logs.length === 0) return null;
  return logs.reduce((highest, log) => 
    log.weight > highest.weight ? log : highest
  , logs[0]);
};

const ArchivedWeightCurve: React.FC<ArchivedWeightCurveProps> = ({ weightLogs }) => {
  const { t, i18n } = useTranslation('pregnancy');
  const locale = i18n.language === 'sv' ? sv : undefined;

  const highestWeight = useMemo(() => findHighestWeight(weightLogs), [weightLogs]);

  const chartData = weightLogs
    .slice()
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(log => ({
      date: format(log.date, 'MMM dd', { locale }),
      weight: log.weight,
      fullDate: format(log.date, 'PPP', { locale }),
      notes: log.notes,
      isHighest: highestWeight?.id === log.id
    }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isHighest) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#16a34a"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill="#8b5cf6" />;
  };

  if (weightLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-green-500" />
            {t('archived.weight.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t('archived.weight.noData')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate dynamic Y-axis domain
  const weights = weightLogs.map(log => log.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-green-500" />
          {t('archived.weight.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'kg', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
              formatter={(value: any, name: string, props: any) => {
                const notes = props.payload.notes;
                return [
                  <div key="weight">
                    <p className="font-medium">{value} kg</p>
                    <p className="text-sm text-muted-foreground">{props.payload.fullDate}</p>
                    {notes && <p className="text-xs mt-1 text-greige-600">{notes}</p>}
                    {props.payload.isHighest && (
                      <p className="text-xs mt-1 text-green-600 font-medium">
                        {t('archived.weight.highest')}
                      </p>
                    )}
                  </div>,
                  ''
                ];
              }}
              labelStyle={{ display: 'none' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#16a34a"
              strokeWidth={2}
              dot={<CustomDot />}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {highestWeight && (
            <p>
              {t('archived.weight.highest')}: {highestWeight.weight} kg {' '}
              ({format(highestWeight.date, 'PPP', { locale })})
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedWeightCurve;
