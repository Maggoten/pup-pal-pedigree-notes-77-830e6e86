import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DogHealthService } from '@/services/dogs/dogHealthService';
import { HealthTestType } from '@/types/dogs';

interface AddHealthTestDialogProps {
  dogId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddHealthTestDialog: React.FC<AddHealthTestDialogProps> = ({
  dogId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { t } = useTranslation('dogs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testType, setTestType] = useState<HealthTestType>('hd');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [result, setResult] = useState('');
  const [vet, setVet] = useState('');
  const [notes, setNotes] = useState('');

  const testTypes = [
    { value: 'hd', label: t('health.tests.types.hd', 'HD X-ray') },
    { value: 'ed', label: t('health.tests.types.ed', 'ED X-ray') },
    { value: 'eye', label: t('health.tests.types.eye', 'Eye Examination') },
    { value: 'other', label: t('health.tests.types.other', 'Other') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !result.trim()) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.tests.validation.required', 'Date and result are required'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await DogHealthService.addHealthTest(dogId, {
        type: testType,
        date: date.toISOString().split('T')[0],
        result: result.trim(),
        vet: vet.trim() || undefined,
        notes: notes.trim() || undefined
      });

      toast({
        title: t('health.tests.addSuccess', 'Test added'),
        description: t('health.tests.addSuccessDesc', 'Health test has been recorded')
      });

      // Reset form
      setTestType('hd');
      setDate(new Date());
      setResult('');
      setVet('');
      setNotes('');
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.tests.addError', 'Failed to add health test'),
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
            <DialogTitle>{t('health.tests.addDialog.title', 'Add Health Test')}</DialogTitle>
            <DialogDescription>
              {t('health.tests.addDialog.description', 'Record a health test result for your dog')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testType">{t('health.tests.type', 'Test Type')}</Label>
              <Select value={testType} onValueChange={(v) => setTestType(v as HealthTestType)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('health.tests.selectType', 'Select type')} />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('health.tests.date', 'Date')}</Label>
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
                    {date ? format(date, "yyyy-MM-dd") : t('health.tests.selectDate', 'Select date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">{t('health.tests.result', 'Result')} *</Label>
              <Input
                id="result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder={t('health.tests.resultPlaceholder', 'e.g., A/A, 0/0, Clear')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet">{t('health.tests.vet', 'Vet/Clinic')}</Label>
              <Input
                id="vet"
                value={vet}
                onChange={(e) => setVet(e.target.value)}
                placeholder={t('health.tests.vetPlaceholder', 'Optional')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('health.tests.notes', 'Notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('health.tests.notesPlaceholder', 'Additional notes...')}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading', 'Loading...') : t('health.tests.addTest', 'Add Test')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHealthTestDialog;
