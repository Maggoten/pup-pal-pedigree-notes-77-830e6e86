import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CreateHeatCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dog: Dog;
  onSuccess: () => void;
}

type HeatType = 'active' | 'previous';

const CreateHeatCycleDialog: React.FC<CreateHeatCycleDialogProps> = ({
  open,
  onOpenChange,
  dog,
  onSuccess
}) => {
  const { t } = useTranslation('dogs');
  const { toast } = useToast();
  const [heatType, setHeatType] = useState<HeatType>('active');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!startDate) {
      newErrors.startDate = t('heatTracking.dialog.validation.dateRequired');
    } else if (startDate > new Date()) {
      newErrors.startDate = t('heatTracking.dialog.validation.futureDate');
    }

    if (heatType === 'previous') {
      if (!endDate) {
        newErrors.endDate = t('heatTracking.dialog.validation.endDateRequired');
      } else if (endDate > new Date()) {
        newErrors.endDate = t('heatTracking.dialog.validation.futureDate');
      } else if (startDate && endDate <= startDate) {
        newErrors.endDate = t('heatTracking.dialog.validation.endDateAfterStart');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create the heat cycle first
      const result = await HeatService.createHeatCycle(dog.id, startDate!, notes || undefined);
      
      if (result) {
        // If it's a previous heat cycle, set the end date
        if (heatType === 'previous' && endDate) {
          await HeatService.endHeatCycle(result.id, endDate);
        }
        
        toast({
          title: t('heatTracking.dialog.success.created'),
          description: t('heatTracking.dialog.success.createdDescription') + ' Synced to calendar.'
        });
        onSuccess();
        handleCancel();
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

  const handleCancel = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes('');
    setHeatType('active');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('heatTracking.dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('heatTracking.dialog.description', { dogName: dog.name })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>{t('heatTracking.dialog.type.label')}</Label>
            <RadioGroup 
              value={heatType} 
              onValueChange={(value: HeatType) => setHeatType(value)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors touch-manipulation">
                <RadioGroupItem value="active" id="active" />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t('heatTracking.dialog.type.active')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('heatTracking.dialog.type.activeDescription')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors touch-manipulation">
                <RadioGroupItem value="previous" id="previous" />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="previous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t('heatTracking.dialog.type.previous')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('heatTracking.dialog.type.previousDescription')}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t('heatTracking.dialog.startDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal touch-manipulation",
                    !startDate && "text-muted-foreground",
                    errors.startDate && "border-destructive"
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
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          {heatType === 'previous' && (
            <div className="space-y-2">
              <Label>{t('heatTracking.dialog.endDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal touch-manipulation",
                      !endDate && "text-muted-foreground",
                      errors.endDate && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : t('heatTracking.dialog.selectEndDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date > new Date() || (startDate && date <= startDate)}
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{t('heatTracking.dialog.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('heatTracking.dialog.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            disabled={isLoading}
            className="w-full sm:w-auto touch-manipulation"
          >
            {t('form.actions.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!startDate || (heatType === 'previous' && !endDate) || isLoading}
            className="w-full sm:w-auto touch-manipulation"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {heatType === 'previous' ? t('heatTracking.dialog.registerPrevious') : t('heatTracking.dialog.startCycle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHeatCycleDialog;