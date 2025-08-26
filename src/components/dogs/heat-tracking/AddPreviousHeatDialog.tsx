import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';
import { HeatService } from '@/services/HeatService';
import { format } from 'date-fns';
import { Dog } from '@/types/dogs';

interface AddPreviousHeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dog: Dog;
  onSuccess: () => void;
}

const AddPreviousHeatDialog: React.FC<AddPreviousHeatDialogProps> = ({
  open,
  onOpenChange,
  dog,
  onSuccess
}) => {
  const { t } = useTranslation('dogs');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validate start date
    if (!startDate) {
      newErrors.startDate = t('heatTracking.addPreviousHeat.validation.dateRequired');
    } else {
      const selectedDate = new Date(startDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      // Check if date is in the future
      if (selectedDate > today) {
        newErrors.startDate = t('heatTracking.addPreviousHeat.validation.dateInFuture');
      } else {
        // Check for duplicate dates in existing heat cycles
        try {
          const existingCycles = await HeatService.getHeatCycles(dog.id);
          const selectedDateString = selectedDate.toDateString();
          
          const duplicateInCycles = existingCycles.some(cycle => 
            new Date(cycle.start_date).toDateString() === selectedDateString
          );

          // Check for duplicates in heat history
          const heatHistory = dog.heatHistory || [];
          const duplicateInHistory = heatHistory.some(heat =>
            new Date(heat.date).toDateString() === selectedDateString
          );

          if (duplicateInCycles || duplicateInHistory) {
            newErrors.startDate = t('heatTracking.addPreviousHeat.validation.duplicateDate');
          }
        } catch (error) {
          console.error('Error checking for duplicates:', error);
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setIsLoading(true);
    try {
      const heatCycle = await HeatService.createHeatCycle(
        dog.id,
        new Date(startDate),
        notes || undefined
      );

      if (heatCycle) {
        toast({
          title: t('heatTracking.addPreviousHeat.success.title'),
          description: t('heatTracking.addPreviousHeat.success.description'),
        });
        
        // Reset form
        setStartDate('');
        setNotes('');
        setErrors({});
        
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to create heat cycle');
      }
    } catch (error) {
      console.error('Error adding previous heat:', error);
      toast({
        title: t('heatTracking.addPreviousHeat.error.title'),
        description: t('heatTracking.addPreviousHeat.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStartDate('');
    setNotes('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('heatTracking.addPreviousHeat.title')}
          </DialogTitle>
          <DialogDescription>
            {t('heatTracking.addPreviousHeat.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">
              {t('heatTracking.addPreviousHeat.startDate')}
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className={errors.startDate ? 'border-destructive' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              {t('heatTracking.addPreviousHeat.notes')}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('heatTracking.addPreviousHeat.placeholders.notes')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('heatTracking.addPreviousHeat.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('heatTracking.addPreviousHeat.buttons.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPreviousHeatDialog;