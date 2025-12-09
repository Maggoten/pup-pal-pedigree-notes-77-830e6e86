import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { WeightRecord } from './types';
import DateTimeInput from '../temperature/DateTimeInput';
import { useTranslation } from 'react-i18next';

interface WeightLogFormProps {
  onAddWeight: (record: Omit<WeightRecord, 'id'>) => void;
}

const WeightLogForm: React.FC<WeightLogFormProps> = ({ onAddWeight }) => {
  const { t } = useTranslation('pregnancy');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  );
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    if (!weight) {
      toast({
        title: t('weight.validation.weightRequired'),
        description: t('weight.validation.weightRequiredDescription'),
        variant: "destructive"
      });
      return;
    }
    
    const weightFloat = parseFloat(weight);
    if (isNaN(weightFloat)) {
      toast({
        title: t('weight.validation.invalidWeight'),
        description: t('weight.validation.invalidWeightDescription'),
        variant: "destructive"
      });
      return;
    }
    
    // Combine date and time
    const combinedDate = new Date(date);
    const [hours, minutes] = time.split(':');
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    onAddWeight({
      date: combinedDate,
      weight: weightFloat,
      notes: notes.trim() || undefined
    });
    
    // Reset form
    setWeight('');
    setNotes('');
    setDate(new Date());
    setTime(new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
      <DateTimeInput 
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
      />
      
      <div className="space-y-2">
        <Label htmlFor="weight">{t('weight.form.weightLabel')}</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={t('weight.form.weightPlaceholder')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">{t('weight.form.notesLabel')}</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('weight.form.notesPlaceholder')}
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" /> {t('weight.actions.addWeight')}
      </Button>
    </div>
  );
};

export default WeightLogForm;
