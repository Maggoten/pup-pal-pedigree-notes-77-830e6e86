import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, TrendingUp, Thermometer } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import CreateHeatCycleDialog from './CreateHeatCycleDialog';
import HeatCycleCard from './HeatCycleCard';
import { EditLegacyHeatDialog } from './EditLegacyHeatDialog';
import { DeleteLegacyHeatDialog } from './DeleteLegacyHeatDialog';
import ProgesteroneChart from './ProgesteroneChart';
import OptimalMatingWindow from './OptimalMatingWindow';
import TemperatureTrendChart from './TemperatureTrendChart';
import PreviousHeatsList from './PreviousHeatsList';
import UnifiedHeatOverview from './UnifiedHeatOverview';
import { useUnifiedHeatDataQuery } from '@/hooks/heat/useUnifiedHeatDataQuery';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface HeatTrackingTabProps {
  dog: Dog;
}

const HeatTrackingTab: React.FC<HeatTrackingTabProps> = ({ dog }) => {
  const { t } = useTranslation('dogs');
  const { 
    data: { heatCycles, heatHistory }, 
    isLoading, 
    refresh 
  } = useUnifiedHeatDataQuery(dog.id);
  const [allHeatLogs, setAllHeatLogs] = useState<HeatLog[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadHeatLogs();
  }, [heatCycles]);

  const loadHeatLogs = async () => {
    // Only load logs from active (ongoing) heat cycles
    const activeCycles = heatCycles.filter(cycle => !cycle.end_date);
    
    if (!activeCycles.length) {
      setAllHeatLogs([]);
      return;
    }

    try {
      const allLogs: HeatLog[] = [];
      for (const cycle of activeCycles) {
        const logs = await HeatService.getHeatLogs(cycle.id);
        allLogs.push(...logs);
      }
      
      // Sort by date (oldest first for chart display)
      allLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAllHeatLogs(allLogs);
    } catch (error) {
      console.error('Error loading heat logs:', error);
    }
  };

  // Filter for chart data
  const temperatureLogs = allHeatLogs.filter(log => log.temperature !== null && log.temperature !== undefined);
  const progesteroneLogs = allHeatLogs.filter(log => log.progesterone_value !== null && log.progesterone_value !== undefined);
  const hasAnalysisData = temperatureLogs.length > 0 || progesteroneLogs.length > 0;

  const handleStartCycleSuccess = () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Unified Heat Overview */}
        <UnifiedHeatOverview 
          dog={dog} 
          heatCycles={heatCycles} 
          heatHistory={heatHistory}
          isLoading={isLoading}
        />

      {/* New Heat Button - Always Available */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('heatTracking.current.title')}</h2>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="touch-manipulation"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('heatTracking.cycles.newHeat')}
        </Button>
      </div>

      {/* Active Heat Cycles */}
      {heatCycles.filter(cycle => !cycle.end_date).length > 0 ? (
        <div className="space-y-4">
          {heatCycles
            .filter(cycle => !cycle.end_date)
            .map((cycle) => (
              <HeatCycleCard 
                key={cycle.id} 
                heatCycle={cycle} 
                onUpdate={refresh}
              />
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Thermometer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">{t('heatTracking.cycles.noActive')}</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {t('heatTracking.cycles.noActiveDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Analysis Section - Charts together */}
      {hasAnalysisData && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('heatTracking.analytics.title')}</h2>
          
          {progesteroneLogs.length > 0 && (
            <ProgesteroneChart heatLogs={allHeatLogs} />
          )}
          
          {temperatureLogs.length > 0 && (
            <TemperatureTrendChart heatLogs={temperatureLogs} />
          )}
        </div>
      )}

      {/* Previous Heats - Unified List */}
      <PreviousHeatsList 
        dog={dog}
        heatCycles={heatCycles}
        onUpdate={refresh}
      />


      <CreateHeatCycleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        dog={dog}
        onSuccess={handleStartCycleSuccess}
      />
    </div>
  );
};

export default HeatTrackingTab;