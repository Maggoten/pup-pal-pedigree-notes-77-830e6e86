
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white to-greige-50 border border-sage-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="date" className="text-sm font-semibold text-sage-700">
              {t('temperature.form.dateLabel')}
            </Label>
            <DatePicker 
              date={date} 
              setDate={setDate} 
              label="" 
              className="w-full"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="temperature" className="text-sm font-semibold text-sage-700">
              {t('temperature.form.temperatureLabel')}
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={t('temperature.form.temperaturePlaceholder')}
              className="h-12 text-lg font-medium border-sage-300 focus:border-sage-500"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <Label htmlFor="notes" className="text-sm font-semibold text-sage-700">
            {t('temperature.form.notesLabel')}
          </Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('temperature.form.notesPlaceholder')}
            className="h-12 border-sage-300 focus:border-sage-500"
          />
        </div>
        
        <div className="mt-8 flex justify-center lg:justify-start">
          <Button 
            onClick={handleSubmit} 
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" /> 
            {t('actions.addTemperature')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemperatureLogForm;
