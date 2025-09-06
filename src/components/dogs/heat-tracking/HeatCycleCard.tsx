import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Plus, Eye, Calendar, Clock, Trash2, StopCircle, TestTube, Edit } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import HeatLoggingDialog from './HeatLoggingDialog';
import HeatLogsDialog from './HeatLogsDialog';
import EndHeatCycleDialog from './EndHeatCycleDialog';
import EditHeatCycleDialog from './EditHeatCycleDialog';
import ProgesteroneChart from './ProgesteroneChart';
import OptimalMatingWindow from './OptimalMatingWindow';
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';
import { toast } from '@/hooks/use-toast';
import { calculateOptimalMatingDays, getNextTestRecommendation } from '@/utils/progesteroneCalculator';
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditNotesDialog, setShowEditNotesDialog] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [showDeleteEntryDialog, setShowDeleteEntryDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<HeatLog | null>(null);
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

  const handleDeleteNotes = async () => {
    try {
      const success = await HeatService.updateHeatCycle(heatCycle.id, { notes: null });
      if (success) {
        toast({
          title: t('heatTracking.notes.deleteSuccess'),
          description: t('heatTracking.notes.deleteSuccessDescription'),
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast({
        title: t('heatTracking.notes.deleteError'),
        description: t('heatTracking.notes.deleteErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const success = await HeatService.deleteHeatLog(entryId);
      if (success) {
        toast({
          title: t('heatTracking.logs.deleteSuccess'),
          description: t('heatTracking.logs.deleteSuccessDescription'),
        });
        loadHeatLogs();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting heat log entry:', error);
      toast({
        title: t('heatTracking.logs.deleteError'),
        description: t('heatTracking.logs.deleteErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setShowDeleteEntryDialog(false);
      setEntryToDelete(null);
    }
  };

  const handleEditNotes = async (newNotes: string) => {
    try {
      const success = await HeatService.updateHeatCycle(heatCycle.id, { notes: newNotes });
      if (success) {
        toast({
          title: t('heatTracking.notes.editSuccess'),
          description: t('heatTracking.notes.editSuccessDescription'),
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: t('heatTracking.notes.editError'),
        description: t('heatTracking.notes.editErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setShowEditNotesDialog(false);
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

  // Calculate progesterone-based mating window
  const matingWindow = calculateOptimalMatingDays(heatLogs);
  const lastProgesteroneTest = heatLogs
    .filter(log => log.test_type === 'progesterone')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const nextTestDate = lastProgesteroneTest 
    ? getNextTestRecommendation(matingWindow, new Date(lastProgesteroneTest.date))
    : null;

  // Check if there are any progesterone tests
  const hasProgesteroneData = heatLogs.some(log => log.test_type === 'progesterone' && log.progesterone_value !== null);

  return (
    <>
      <Card className={`${isActive ? 'border-primary shadow-sm' : 'border-muted'} transition-shadow hover:shadow-md`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-2">
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
              {/* Add Entry button aligned with active badge on mobile */}
              {isActive && (
                <Button 
                  className="w-full sm:hidden touch-manipulation"
                  onClick={() => setShowLoggingDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('heatTracking.logging.addEntry')}
                </Button>
              )}
            </div>
            
            {/* Action buttons - separated from delete for safety */}
            <div className="flex gap-2 w-full sm:w-auto">
              {isActive && (
                <Button 
                  className="hidden sm:flex flex-1 sm:flex-none touch-manipulation"
                  onClick={() => setShowLoggingDialog(true)}
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span>{t('heatTracking.logging.addEntry')}</span>
                </Button>
              )}
              <Button 
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {isActive && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive touch-manipulation"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
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
          {latestLog && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">{t('heatTracking.cycles.latestEntry')}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(latestLog.date), 'MMM dd')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      if (entryToDelete) {
                        handleDeleteEntry(entryToDelete.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 text-sm">
                {latestLog.test_type === 'temperature' && latestLog.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    <span className="font-medium">{latestLog.temperature}°C</span>
                  </div>
                )}
                {latestLog.test_type === 'progesterone' && latestLog.progesterone_value && (
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    <span className="font-medium">{latestLog.progesterone_value} ng/ml</span>
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

          {/* Notes Section - Moved below latest entry */}
          {heatCycle.notes && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">{t('heatTracking.notes')}</h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setEditingNotes(heatCycle.notes || '');
                      setShowEditNotesDialog(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteNotes()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                {heatCycle.notes}
              </div>
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

          {/* Progesterone Chart */}
          {hasProgesteroneData && (
            <ProgesteroneChart heatLogs={heatLogs} />
          )}

          {/* Optimal Mating Window */}
          {hasProgesteroneData && isActive && (
            <OptimalMatingWindow 
              matingWindow={matingWindow}
              nextTestDate={nextTestDate}
            />
          )}

          {/* End cycle button at bottom for active cycles */}
          {isActive && (
            <div className="flex justify-center pt-4 border-t">
              <Button 
                variant="outline"
                className="touch-manipulation"
                onClick={() => setShowEndDialog(true)}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                {t('heatTracking.cycles.endCycle')}
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

      <EditHeatCycleDialog 
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        heatCycle={heatCycle}
        onSuccess={onUpdate}
        showTrigger={false}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title={t('heatTracking.deleteDialog.title')}
        description={t('heatTracking.deleteDialog.description')}
        itemDetails={`${t('heatTracking.cycles.title')} - ${format(startDate, 'yyyy-MM-dd')}`}
      />

      {/* Delete Entry Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteEntryDialog}
        onOpenChange={setShowDeleteEntryDialog}
        onConfirm={() => {
          if (entryToDelete) {
            handleDeleteEntry(entryToDelete.id);
          }
        }}
        title={t('heatTracking.logs.deleteConfirmTitle')}
        description={t('heatTracking.logs.deleteConfirmDescription')}
        itemDetails={entryToDelete ? format(parseISO(entryToDelete.date), 'yyyy-MM-dd') : ''}
      />

      {/* Edit Notes Dialog - Simple dialog for editing notes */}
      {showEditNotesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('heatTracking.notes.editTitle')}</h3>
            <textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="w-full h-32 p-2 border rounded-md resize-none"
              placeholder={t('heatTracking.notes.placeholder')}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleEditNotes(editingNotes)}
                className="flex-1"
              >
                {t('common.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditNotesDialog(false)}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeatCycleCard;