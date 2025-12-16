import React, { useState, useEffect } from 'react';
import { Dog } from '@/types/dogs';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Scale, Ruler, Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DogHealthService, DogWeightLog, DogHeightLog } from '@/services/dogs/dogHealthService';
import DogMeasurementsDialog from './DogMeasurementsDialog';
import DogMeasurementsChart from './DogMeasurementsChart';
import MeasurementHistoryDialog from './MeasurementHistoryDialog';

interface DogMeasurementsSectionProps {
  dog: Dog;
}

const DogMeasurementsSection: React.FC<DogMeasurementsSectionProps> = ({ dog }) => {
  const { t } = useTranslation('dogs');
  const [showDialog, setShowDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [weightLogs, setWeightLogs] = useState<DogWeightLog[]>([]);
  const [heightLogs, setHeightLogs] = useState<DogHeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const [weights, heights] = await Promise.all([
        DogHealthService.getWeightLogs(dog.id),
        DogHealthService.getHeightLogs(dog.id)
      ]);
      setWeightLogs(weights);
      setHeightLogs(heights);
    } catch (error) {
      console.error('Failed to fetch measurement logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dog.id]);

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
  const latestHeight = heightLogs.length > 0 ? heightLogs[heightLogs.length - 1] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          {t('health.measurements.title', 'Weight & Height')}
        </h3>
        <div className="flex gap-2">
          {(weightLogs.length > 0 || heightLogs.length > 0) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
              className="flex-1 sm:flex-none"
            >
              <History className="h-4 w-4 mr-1" />
              {t('health.measurements.history', 'History')}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDialog(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('health.measurements.logMeasurement', 'Log Measurement')}
          </Button>
        </div>
      </div>

      {/* Latest measurements summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-warmbeige-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{t('health.measurements.weight', 'Weight')}</span>
          </div>
          {latestWeight ? (
            <div>
              <p className="text-2xl font-bold">{latestWeight.weight} kg</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(latestWeight.date), 'yyyy-MM-dd')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('health.measurements.noData', 'No data')}
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg border border-warmbeige-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{t('health.measurements.height', 'Height')}</span>
          </div>
          {latestHeight ? (
            <div>
              <p className="text-2xl font-bold">{latestHeight.height} cm</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(latestHeight.date), 'yyyy-MM-dd')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('health.measurements.noData', 'No data')}
            </p>
          )}
        </div>
      </div>

      {/* Charts - stacked vertically for mobile */}
      {(weightLogs.length > 0 || heightLogs.length > 0) && (
        <div className="space-y-6">
          {weightLogs.length > 0 && (
            <DogMeasurementsChart
              data={weightLogs.map(log => ({
                date: log.date,
                value: log.weight
              }))}
              label={t('health.measurements.weight', 'Weight')}
              unit="kg"
              color="hsl(var(--primary))"
            />
          )}
          {heightLogs.length > 0 && (
            <DogMeasurementsChart
              data={heightLogs.map(log => ({
                date: log.date,
                value: log.height
              }))}
              label={t('health.measurements.height', 'Height')}
              unit="cm"
              color="hsl(var(--chart-2))"
            />
          )}
        </div>
      )}

      <DogMeasurementsDialog
        dogId={dog.id}
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={fetchLogs}
      />

      <MeasurementHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        weightLogs={weightLogs}
        heightLogs={heightLogs}
        onUpdate={fetchLogs}
      />
    </div>
  );
};

export default DogMeasurementsSection;
