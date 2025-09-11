
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { TemperatureRecord } from '../temperature/types';
import DatePicker from '@/components/common/DatePicker';
import { useTranslation } from 'react-i18next';

interface TemperatureLogFormProps {
  onAddTemperature: (record: Omit<TemperatureRecord, 'id'>) => void;
}

const TemperatureLogForm: React.FC<TemperatureLogFormProps> = ({ onAddTemperature }) => {
  const { t } = useTranslation('pregnancy');
  const [date, setDate] = useState<Date>(new Date());
  const [temperature, setTemperature] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    if (!temperature) {
      toast({
        title: t('validation.temperatureRequired'),
        description: t('validation.temperatureRequiredDescription'),
        variant: "destructive"
      });
      return;
    }
    
    const tempFloat = parseFloat(temperature);
    if (isNaN(tempFloat)) {
      toast({
        title: t('validation.invalidTemperature'),
        description: t('validation.invalidTemperatureDescription'),
        variant: "destructive"
      });
      return;
    }
    
    onAddTemperature({
      date,
      temperature: tempFloat,
      notes: notes.trim() || undefined
    });
    
    // Reset form
    setTemperature('');
    setNotes('');
    setDate(new Date());
  };

  return (
    <div className="space-y-4 border rounded-lg p-3 sm:p-4 bg-greige-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t('temperature.form.dateLabel')}</Label>
          <DatePicker 
            date={date} 
            setDate={setDate} 
            label="" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="temperature">{t('temperature.form.temperatureLabel')}</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder={t('temperature.form.temperaturePlaceholder')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">{t('temperature.form.notesLabel')}</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('temperature.form.notesPlaceholder')}
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full md:w-auto justify-center bg-sage-600 hover:bg-sage-700 text-white"
      >
        <Plus className="mr-2 h-4 w-4" /> {t('actions.addTemperature')}
      </Button>
    </div>
  );
};

export default TemperatureLogForm;
