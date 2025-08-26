import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Thermometer, Edit, Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/hooks/use-toast';
import HeatLoggingDialog from './HeatLoggingDialog';
import EditHeatLogDialog from './EditHeatLogDialog';
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface HeatLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatCycle: HeatCycle;
  onUpdate: () => void;
}

const HeatLogsDialog: React.FC<HeatLogsDialogProps> = ({ 
  open, 
  onOpenChange, 
  heatCycle,
  onUpdate 
}) => {
  const { t } = useTranslation('dogs');
  const [heatLogs, setHeatLogs] = useState<HeatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<HeatLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startDate = parseISO(heatCycle.start_date);
  const isActive = !heatCycle.end_date;

  useEffect(() => {
    if (open) {
      loadHeatLogs();
    }
  }, [open, heatCycle.id]);

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
    setShowAddDialog(false);
  };

  const handleEditSuccess = () => {
    loadHeatLogs();
    onUpdate();
    setShowEditDialog(false);
    setSelectedLog(null);
  };

  const handleDelete = async () => {
    if (!selectedLog) return;
    
    setIsDeleting(true);
    try {
      const success = await HeatService.deleteHeatLog(selectedLog.id);
      if (success) {
        toast({
          title: 'Log Deleted',
          description: 'Heat log entry has been deleted successfully.',
        });
        loadHeatLogs();
        onUpdate();
        setShowDeleteDialog(false);
        setSelectedLog(null);
      } else {
        throw new Error('Failed to delete heat log');
      }
    } catch (error) {
      console.error('Error deleting heat log:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the heat log entry.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'proestrus': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'estrus': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'metestrus': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'anestrus': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Heat Cycle Logs
            </DialogTitle>
            <DialogDescription>
              All log entries for heat cycle started on {format(startDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {heatLogs.length} {heatLogs.length === 1 ? 'entry' : 'entries'}
            </p>
            {isActive && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading logs...
                </div>
              ) : heatLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Thermometer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No log entries yet</p>
                  {isActive && (
                    <p className="text-xs mt-1">Add your first entry to start tracking</p>
                  )}
                </div>
              ) : (
                heatLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {format(parseISO(log.date), 'MMM dd, yyyy')}
                        </span>
                        {log.phase && (
                          <Badge variant="secondary" className={`text-xs ${getPhaseColor(log.phase)}`}>
                            {t(`heatTracking.phases.${log.phase}`)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {log.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          <span>{log.temperature}°C</span>
                        </div>
                      )}
                    </div>
                    
                    {log.observations && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Observations: </span>
                        <span>{log.observations}</span>
                      </div>
                    )}
                    
                    {log.notes && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Notes: </span>
                        <span>{log.notes}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <HeatLoggingDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        heatCycle={heatCycle}
        onSuccess={handleLoggingSuccess}
      />

      {selectedLog && (
        <EditHeatLogDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          heatLog={selectedLog}
          onSuccess={handleEditSuccess}
        />
      )}

      <DeleteConfirmationDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Heat Log Entry"
        description="Are you sure you want to delete this heat log entry? This action cannot be undone."
        itemDetails={selectedLog ? `Entry from ${format(parseISO(selectedLog.date), 'MMM dd, yyyy')}` : ''}
      />
    </>
  );
};

export default HeatLogsDialog;