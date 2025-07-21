
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from '@/components/common/DatePicker';
import { toast } from '@/components/ui/use-toast';
import { CustomReminderInput } from '@/types/reminders';
import { useTranslation } from 'react-i18next';

interface AddReminderFormProps {
  onSubmit: (values: CustomReminderInput) => void;
}

const AddReminderForm: React.FC<AddReminderFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation('home');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const handleAddReminder = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: t('forms.reminder.validation.titleRequired'),
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      title,
      description,
      dueDate,
      priority
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setPriority('medium');
    
    toast({
      title: t('forms.reminder.success.added'),
      description: t('forms.reminder.success.addedDesc')
    });
  };
  
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <div className="space-y-2">
        <Label htmlFor="title">{t('forms.reminder.title')}</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder={t('forms.reminder.titlePlaceholder')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">{t('forms.reminder.description')}</Label>
        <Input 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder={t('forms.reminder.descriptionPlaceholder')}
        />
      </div>
      
      <div className="space-y-2">
        <Label>{t('forms.reminder.dueDate')}</Label>
        <DatePicker date={dueDate} setDate={setDueDate} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priority">{t('forms.reminder.priority')}</Label>
        <Select 
          value={priority} 
          onValueChange={(value) => setPriority(value as 'high' | 'medium' | 'low')}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('forms.reminder.selectPriority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">{t('forms.reminder.priorities.high')}</SelectItem>
            <SelectItem value="medium">{t('forms.reminder.priorities.medium')}</SelectItem>
            <SelectItem value="low">{t('forms.reminder.priorities.low')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleAddReminder} 
        className="w-full"
      >
        {t('forms.reminder.addReminder')}
      </Button>
    </div>
  );
};

export default AddReminderForm;
