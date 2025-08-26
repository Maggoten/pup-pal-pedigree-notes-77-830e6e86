import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Plus, Eye, Calendar, Clock, Trash2, StopCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import HeatLoggingDialog from './HeatLoggingDialog';
import HeatLogsDialog from './HeatLogsDialog';
import EndHeatCycleDialog from './EndHeatCycleDialog';
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface HeatCycleCardProps {
  heatCycle: HeatCycle;
  onUpdate: () => void;
}

const HeatCycleCard: React.FC<HeatCycleCardProps> = ({ heatCycle, onUpdate }) => {
  const { t } = useTranslation('dogs');
  const [heatLogs, setHeatLogs] = useState<HeatLog[]>([]);
  const [showLoggingDialog, setShowLoggingDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = !heatCycle.end_date;
  const startDate = parseISO(heatCycle.start_date);
  const endDate = heatCycle.end_date ? parseISO(heatCycle.end_date) : null;
  const daysFromStart = differenceInDays(new Date(), startDate);
  const cycleDuration = endDate ? differenceInDays(endDate, startDate) : daysFromStart;

  useEffect(() => {
    loadHeatLogs();
  }, [heatCycle.id]);

  const loadHeatLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await HeatService.getHeatLogs(heatCycle.id);
      setHeatLogs(logs);
    } catch (error) {
      console.error('Error loading heat logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoggingSuccess = () => {
    loadHeatLogs();
    onUpdate();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await HeatService.deleteHeatCycle(heatCycle.id);
      if (success) {
        toast({
          title: t('heatTracking.deleteSuccess.title'),
          description: t('heatTracking.deleteSuccess.description'),
        });
        onUpdate();
        setShowDeleteDialog(false);
      } else {
        throw new Error('Failed to delete heat cycle');
      }
    } catch (error) {
      console.error('Error deleting heat cycle:', error);
      toast({
        title: t('heatTracking.deleteError.title'),
        description: t('heatTracking.deleteError.description'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'proestrus': return 'bg-pink-100 text-pink-800';
      case 'estrus': return 'bg-red-100 text-red-800';
      case 'metestrus': return 'bg-orange-100 text-orange-800';
      case 'anestrus': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const latestLog = heatLogs[0];

  return (
    <>
      <Card className={`${isActive ? 'border-primary shadow-sm' : 'border-muted'} transition-shadow hover:shadow-md`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4" />
              <CardTitle className="text-base sm:text-lg">
                {format(startDate, 'MMMM dd, yyyy')}
              </CardTitle>
              {isActive && (
                <Badge variant="default" className="text-xs">
                  {t('heatTracking.cycles.badges.active')}
                </Badge>
              )}
            </div>
            
            {/* Action buttons - separated from delete for safety */}
            {isActive && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  className="flex-1 sm:flex-none touch-manipulation"
                  onClick={() => setShowLoggingDialog(true)}
                >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('heatTracking.logging.addEntry')}</span>
                    <span className="sm:hidden">{t('heatTracking.logging.addEntry')}</span>
                </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 sm:flex-none touch-manipulation"
                    onClick={() => setShowEndDialog(true)}
                  >
                    <StopCircle className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('heatTracking.cycles.endCycle')}</span>
                  </Button>
              </div>
            )}
          </div>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isActive 
                ? t('heatTracking.cycles.daysSinceStart', { days: daysFromStart })
                : t('heatTracking.cycles.duration', { days: cycleDuration })
              }
            </span>
            {heatLogs.length > 0 && (
              <span className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                {t('heatTracking.cycles.logEntries', { count: heatLogs.length })}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {heatCycle.notes && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
              {heatCycle.notes}
            </div>
          )}

          {latestLog && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">{t('heatTracking.cycles.latestEntry')}</h4>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(latestLog.date), 'MMM dd')}
                </span>
              </div>
              
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 text-sm">
                {latestLog.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    <span className="font-medium">{latestLog.temperature}°C</span>
                  </div>
                )}
                {latestLog.phase && (
                  <div className="flex items-center">
                    <Badge variant="secondary" className={`text-xs ${getPhaseColor(latestLog.phase)}`}>
                      {t(`heatTracking.phases.${latestLog.phase}`)}
                    </Badge>
                  </div>
                )}
              </div>
              
              {latestLog.observations && (
                <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted/50 rounded line-clamp-2">
                  {latestLog.observations}
                </p>
              )}
            </div>
          )}

          {heatLogs.length === 0 && !isLoading && (
            <div className="text-center py-6 text-muted-foreground">
              <Thermometer className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">{t('heatTracking.cycles.noLogs')}</p>
              {isActive && (
                <p className="text-xs mt-2 text-muted-foreground/80">{t('heatTracking.cycles.startLogging')}</p>
              )}
            </div>
          )}

          {heatLogs.length > 1 && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="ghost" 
                className="text-sm touch-manipulation"
                onClick={() => setShowLogsDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('heatTracking.cycles.viewAllLogs', { count: heatLogs.length })}
              </Button>
            </div>
          )}

          {/* Delete button at bottom for active cycles */}
          {isActive && (
            <div className="flex justify-center pt-4 border-t">
              <Button 
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive touch-manipulation"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('heatTracking.cycles.deleteButton')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <HeatLoggingDialog
        open={showLoggingDialog}
        onOpenChange={setShowLoggingDialog}
        heatCycle={heatCycle}
        onSuccess={handleLoggingSuccess}
      />

      <HeatLogsDialog
        open={showLogsDialog}
        onOpenChange={setShowLogsDialog}
        heatCycle={heatCycle}
        onUpdate={onUpdate}
      />

      <EndHeatCycleDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        heatCycle={heatCycle}
        onSuccess={onUpdate}
      />

      <DeleteConfirmationDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title={t('heatTracking.deleteDialog.title')}
        description={t('heatTracking.deleteDialog.description')}
        itemDetails={`${t('heatTracking.cycles.title')} - ${format(startDate, 'yyyy-MM-dd')}`}
      />
    </>
  );
};

export default HeatCycleCard;