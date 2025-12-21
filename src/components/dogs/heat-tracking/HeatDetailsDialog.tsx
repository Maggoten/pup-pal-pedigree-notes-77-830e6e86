import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Thermometer, TestTube, FileText } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import { supabase } from '@/integrations/supabase/client';
import ProgesteroneChart from './ProgesteroneChart';
import TemperatureTrendChart from './TemperatureTrendChart';
import OptimalMatingWindow from './OptimalMatingWindow';
import MatingDatesSection from './MatingDatesSection';
import { calculateOptimalMatingDays, getNextTestRecommendation } from '@/utils/progesteroneCalculator';
import { getStoredUnit, formatProgesteroneValue } from '@/utils/progesteroneUnits';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface HeatDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatCycle: HeatCycle | null;
}

interface MatingDateData {
  id: string;
  mating_date: string;
  pregnancy_id: string | null;
}

const HeatDetailsDialog: React.FC<HeatDetailsDialogProps> = ({
  open,
  onOpenChange,
  heatCycle
}) => {
  const { t } = useTranslation('dogs');
  const unit = getStoredUnit();
  const [heatLogs, setHeatLogs] = useState<HeatLog[]>([]);
  const [matingDates, setMatingDates] = useState<MatingDateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && heatCycle) {
      loadHeatData();
    }
  }, [open, heatCycle?.id]);

  const loadHeatData = async () => {
    if (!heatCycle) return;
    
    setIsLoading(true);
    try {
      // Load heat logs
      const logs = await HeatService.getHeatLogs(heatCycle.id);
      setHeatLogs(logs);
      
      // Load mating dates linked to this heat cycle
      const { data: matingData } = await supabase
        .from('mating_dates')
        .select('id, mating_date, pregnancy_id')
        .eq('heat_cycle_id', heatCycle.id)
        .order('mating_date', { ascending: true });
      
      setMatingDates(matingData || []);
    } catch (error) {
      console.error('Error loading heat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!heatCycle) return null;

  const startDate = parseISO(heatCycle.start_date);
  const endDate = heatCycle.end_date ? parseISO(heatCycle.end_date) : null;
  const duration = endDate ? differenceInDays(endDate, startDate) : null;
  
  // Get progesterone logs for calculations
  const progesteroneLogs = heatLogs.filter(log => 
    log.progesterone_value !== null && log.progesterone_value !== undefined
  );
  
  // Get temperature logs
  const temperatureLogs = heatLogs.filter(log => 
    log.temperature !== null && log.temperature !== undefined
  );

  const latestLog = heatLogs.length > 0 
    ? [...heatLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Calculate mating window and next test date
  const matingWindow = progesteroneLogs.length > 0 
    ? calculateOptimalMatingDays(progesteroneLogs) 
    : null;
    
  const nextTestDate = progesteroneLogs.length > 0 && latestLog
    ? getNextTestRecommendation(matingWindow!, new Date(latestLog.date)) 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('heatTracking.details.title')}
          </DialogTitle>
          <DialogDescription>
            {format(startDate, 'MMMM dd, yyyy')}
            {endDate && ` - ${format(endDate, 'MMMM dd, yyyy')}`}
            {duration && ` (${duration} ${t('common.days')})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  {t('heatTracking.temperature.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{temperatureLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {t('heatTracking.details.measurements')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  {t('heatTracking.progesterone.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{progesteroneLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {t('heatTracking.details.tests')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('heatTracking.details.totalLogs')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{heatLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {t('heatTracking.details.entries')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {heatCycle.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t('form.sections.notes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{heatCycle.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Latest Log Info */}
          {latestLog && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t('heatTracking.details.latestEntry')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('common.date')}:
                  </span>
                  <span className="text-sm font-medium">
                    {format(parseISO(latestLog.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                {latestLog.temperature && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('heatTracking.temperature.title')}:
                    </span>
                    <span className="text-sm font-medium">
                      {latestLog.temperature}°C
                    </span>
                  </div>
                )}
                
                {latestLog.progesterone_value && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('heatTracking.progesterone.title')}:
                    </span>
                    <span className="text-sm font-medium">
                      {formatProgesteroneValue(latestLog.progesterone_value, unit)}
                    </span>
                  </div>
                )}

                {latestLog.phase && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('heatTracking.phase.title')}:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {t(`heatTracking.phases.${latestLog.phase}`)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Optimal Mating Window */}
          {matingWindow && (
            <OptimalMatingWindow 
              matingWindow={matingWindow}
              nextTestDate={nextTestDate}
            />
          )}

          {/* Mating Dates Section */}
          {matingDates.length > 0 && (
            <MatingDatesSection
              matingDates={matingDates}
              heatLogs={heatLogs}
              cycleStartDate={heatCycle.start_date}
            />
          )}

          {/* Temperature Chart */}
          {temperatureLogs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t('heatTracking.temperature.trend')}
              </h3>
              <TemperatureTrendChart heatLogs={temperatureLogs} />
            </div>
          )}

          {/* Progesterone Chart */}
          {progesteroneLogs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t('heatTracking.progesterone.chart')}
              </h3>
              <ProgesteroneChart 
                heatLogs={progesteroneLogs}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeatDetailsDialog;