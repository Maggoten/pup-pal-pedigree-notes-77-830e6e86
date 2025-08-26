import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';
import { Dog } from '@/types/dogs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StartHeatCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dog: Dog;
  onSuccess: () => void;
}

const StartHeatCycleDialog: React.FC<StartHeatCycleDialogProps> = ({
  open,
  onOpenChange,
  dog,
  onSuccess
}) => {
  const { t } = useTranslation('dogs');
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!startDate) {
      toast({
        title: t('heatTracking.dialog.validation.dateRequired'),
        variant: 'destructive'
      });
      return;
    }

    // Validate that date is not in the future
    if (startDate > new Date()) {
      toast({
        title: t('heatTracking.dialog.validation.futureDate'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await HeatService.createHeatCycle(dog.id, startDate, notes || undefined);
      
      if (result) {
        toast({
          title: t('heatTracking.dialog.success.created'),
          description: t('heatTracking.dialog.success.createdDescription')
        });
        onSuccess();
        onOpenChange(false);
        // Reset form
        setStartDate(undefined);
        setNotes('');
      } else {
        toast({
          title: t('heatTracking.dialog.error.failed'),
          description: t('heatTracking.dialog.error.failedDescription'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating heat cycle:', error);
      toast({
        title: t('heatTracking.dialog.error.failed'),
        description: t('heatTracking.dialog.error.failedDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('heatTracking.dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('heatTracking.dialog.description', { dogName: dog.name })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('heatTracking.dialog.startDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : t('heatTracking.dialog.selectDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('heatTracking.dialog.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('heatTracking.dialog.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!startDate || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('heatTracking.dialog.startCycle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartHeatCycleDialog;