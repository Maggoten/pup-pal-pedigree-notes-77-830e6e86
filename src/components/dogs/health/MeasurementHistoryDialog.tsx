import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Scale, Ruler, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { DogHealthService, DogWeightLog, DogHeightLog } from '@/services/dogs/dogHealthService';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MeasurementHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weightLogs: DogWeightLog[];
  heightLogs: DogHeightLog[];
  onUpdate: () => void;
}

const MeasurementHistoryDialog: React.FC<MeasurementHistoryDialogProps> = ({
  open,
  onOpenChange,
  weightLogs,
  heightLogs,
  onUpdate
}) => {
  const { t } = useTranslation('dogs');
  const [deleteItem, setDeleteItem] = useState<{ type: 'weight' | 'height'; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteItem) return;
    
    setIsDeleting(true);
    try {
      if (deleteItem.type === 'weight') {
        await DogHealthService.deleteWeightLog(deleteItem.id);
      } else {
        await DogHealthService.deleteHeightLog(deleteItem.id);
      }
      
      toast({
        title: t('health.measurements.deleteSuccess', 'Measurement deleted'),
        description: t('health.measurements.deleteSuccessDesc', 'Measurement has been removed')
      });
      onUpdate();
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.measurements.deleteError', 'Failed to delete measurement'),
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  const sortedWeightLogs = [...weightLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const sortedHeightLogs = [...heightLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('health.measurements.history.title', 'Measurement History')}</DialogTitle>
            <DialogDescription>
              {t('health.measurements.history.description', 'View and manage all recorded measurements')}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="weight" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                {t('health.measurements.weight', 'Weight')} ({weightLogs.length})
              </TabsTrigger>
              <TabsTrigger value="height" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                {t('health.measurements.height', 'Height')} ({heightLogs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                {sortedWeightLogs.length > 0 ? (
                  <div className="space-y-2">
                    {sortedWeightLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Scale className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.weight} kg</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(log.date), 'yyyy-MM-dd')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteItem({ type: 'weight', id: log.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('health.measurements.noWeightData', 'No weight measurements recorded')}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="height" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                {sortedHeightLogs.length > 0 ? (
                  <div className="space-y-2">
                    {sortedHeightLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.height} cm</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(log.date), 'yyyy-MM-dd')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteItem({ type: 'height', id: log.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('health.measurements.noHeightData', 'No height measurements recorded')}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('health.measurements.deleteTitle', 'Delete Measurement')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('health.measurements.deleteConfirm', 'Are you sure you want to delete this measurement? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common.loading', 'Loading...') : t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MeasurementHistoryDialog;
