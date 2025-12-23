import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { parseISODate } from '@/utils/dateUtils';
import { Calendar as CalendarIcon, Scale, Ruler, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';
import { DogHealthService, DogWeightLog, DogHeightLog } from '@/services/dogs/dogHealthService';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CombinedDogMeasurementsDialogProps {
  dogId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weightLogs: DogWeightLog[];
  heightLogs: DogHeightLog[];
  onUpdate: () => void;
}

const CombinedDogMeasurementsDialog: React.FC<CombinedDogMeasurementsDialogProps> = ({
  dogId,
  open,
  onOpenChange,
  weightLogs,
  heightLogs,
  onUpdate
}) => {
  const { t } = useTranslation('dogs');
  const [measurementType, setMeasurementType] = useState<'weight' | 'height'>('weight');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'weight' | 'height'; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDate(new Date());
      setValue('');
    }
  }, [open]);

  const handleAdd = async () => {
    const numValue = parseFloat(value);
    if (!date || isNaN(numValue) || numValue <= 0) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.measurements.validation.required', 'Date and valid value are required'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (measurementType === 'weight') {
        await DogHealthService.addWeightLog(dogId, numValue, date);
      } else {
        await DogHealthService.addHeightLog(dogId, numValue, date);
      }

      toast({
        title: t('health.measurements.addSuccess', 'Measurement logged'),
        description: t('health.measurements.addSuccessDesc', 'Measurement has been recorded')
      });

      setValue('');
      setDate(new Date());
      onUpdate();
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.measurements.addError', 'Failed to log measurement'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              {t('health.measurements.title', 'Weight & Height')}
            </DialogTitle>
            <DialogDescription>
              {t('health.measurements.dialog.combinedDescription', 'Log and manage measurements for your dog')}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={measurementType} onValueChange={(v) => setMeasurementType(v as 'weight' | 'height')} className="w-full">
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

            {/* Add new measurement section */}
            <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    {t('health.measurements.date', 'Date')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy-MM-dd") : t('health.measurements.selectDate', 'Select date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    {measurementType === 'weight' 
                      ? t('health.measurements.weight', 'Weight') + ' (kg)'
                      : t('health.measurements.height', 'Height') + ' (cm)'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={measurementType === 'weight' ? 'e.g., 28.5' : 'e.g., 55'}
                      className="h-9"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAdd}
                      disabled={isSubmitting || !value}
                      className="h-9 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight history */}
            <TabsContent value="weight" className="mt-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {t('health.measurements.history.title', 'History')}
              </div>
              <ScrollArea className="h-[220px] pr-4">
                {sortedWeightLogs.length > 0 ? (
                  <div className="space-y-2">
                    {sortedWeightLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <Scale className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{log.weight} kg</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISODate(log.date), 'yyyy-MM-dd')}
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
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {t('health.measurements.noWeightData', 'No weight measurements recorded')}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Height history */}
            <TabsContent value="height" className="mt-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {t('health.measurements.history.title', 'History')}
              </div>
              <ScrollArea className="h-[220px] pr-4">
                {sortedHeightLogs.length > 0 ? (
                  <div className="space-y-2">
                    {sortedHeightLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <Ruler className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{log.height} cm</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISODate(log.date), 'yyyy-MM-dd')}
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
                  <div className="text-center py-8 text-muted-foreground text-sm">
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

export default CombinedDogMeasurementsDialog;
