
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { SymptomRecord } from './types';
import DatePicker from '@/components/common/DatePicker';
import { useTranslation } from 'react-i18next';

interface SymptomLogFormProps {
  onAddSymptom: (record: Omit<SymptomRecord, 'id'>) => void;
}

const SymptomLogForm: React.FC<SymptomLogFormProps> = ({ onAddSymptom }) => {
  const { t } = useTranslation('pregnancy');
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = () => {
    if (!title) {
      toast({
        title: t('validation.titleRequired'),
        description: t('validation.titleRequiredDescription'),
        variant: "destructive"
      });
      return;
    }
    
    if (!description) {
      toast({
        title: t('validation.descriptionRequired'),
        description: t('validation.descriptionRequiredDescription'),
        variant: "destructive"
      });
      return;
    }
    
    onAddSymptom({
      date,
      title: title.trim(),
      description: description.trim()
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate(new Date());
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t('symptoms.form.dateLabel')}</Label>
          <DatePicker 
            date={date} 
            setDate={setDate} 
            label="" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">{t('symptoms.form.symptomLabel')}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('symptoms.form.symptomPlaceholder')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">{t('symptoms.form.symptomLabel')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('symptoms.form.symptomPlaceholder')}
          rows={3}
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" /> {t('actions.addSymptom')}
      </Button>
    </div>
  );
};

export default SymptomLogForm;
