import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { Thermometer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { TemperatureLog, findLowestTemperature } from '@/services/PregnancyArchivedService';

interface ArchivedTemperatureCurveProps {
  temperatureLogs: TemperatureLog[];
}

const ArchivedTemperatureCurve: React.FC<ArchivedTemperatureCurveProps> = ({ temperatureLogs }) => {
  const { t, i18n } = useTranslation('pregnancy');
  const locale = i18n.language === 'sv' ? sv : undefined;

  const lowestTemp = useMemo(() => findLowestTemperature(temperatureLogs), [temperatureLogs]);

  const chartData = temperatureLogs.map(log => ({
    date: format(log.date, 'MMM dd', { locale }),
    temperature: log.temperature,
    fullDate: format(log.date, 'PPP', { locale }),
    notes: log.notes,
    isLowest: lowestTemp?.id === log.id
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isLowest) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#dc2626"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill="#8b5cf6" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-500" />
          {t('archived.temperature.title')}
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
              domain={[36, 40]}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: '°C', angle: -90, position: 'insideLeft' }}
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
                  <div key="temp">
                    <p className="font-medium">{value}°C</p>
                    <p className="text-sm text-muted-foreground">{props.payload.fullDate}</p>
                    {notes && <p className="text-xs mt-1 text-greige-600">{notes}</p>}
                    {props.payload.isLowest && (
                      <p className="text-xs mt-1 text-red-600 font-medium">
                        {t('archived.temperature.lowestDrop')}
                      </p>
                    )}
                  </div>,
                  ''
                ];
              }}
              labelStyle={{ display: 'none' }}
            />
            <ReferenceLine y={37.8} stroke="#ef4444" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={<CustomDot />}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {lowestTemp && (
            <p>
              {t('archived.temperature.lowestDrop')}: {lowestTemp.temperature}°C {' '}
              ({format(lowestTemp.date, 'PPP', { locale })})
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedTemperatureCurve;