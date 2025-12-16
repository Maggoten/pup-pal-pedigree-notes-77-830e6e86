import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Scale, Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DogHealthService } from '@/services/dogs/dogHealthService';

interface DogMeasurementsDialogProps {
  dogId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DogMeasurementsDialog: React.FC<DogMeasurementsDialogProps> = ({
  dogId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { t } = useTranslation('dogs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [measurementType, setMeasurementType] = useState<'weight' | 'height'>('weight');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      // Reset form
      setValue('');
      setDate(new Date());
      
      onOpenChange(false);
      onSuccess?.();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('health.measurements.dialog.title', 'Log Measurement')}</DialogTitle>
            <DialogDescription>
              {t('health.measurements.dialog.description', 'Record weight or height for your dog')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Tabs value={measurementType} onValueChange={(v) => setMeasurementType(v as 'weight' | 'height')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weight" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  {t('health.measurements.weight', 'Weight')}
                </TabsTrigger>
                <TabsTrigger value="height" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {t('health.measurements.height', 'Height')}
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t('health.measurements.date', 'Date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
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

                <TabsContent value="weight" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">{t('health.measurements.weight', 'Weight')} (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="e.g., 28.5"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="height" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">{t('health.measurements.height', 'Height')} (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="0"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="e.g., 55"
                      required
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading', 'Loading...') : t('health.measurements.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DogMeasurementsDialog;
