import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/common/DatePicker';
import { useTranslation } from 'react-i18next';

interface DateTimeInputProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({ date, setDate, time, setTime }) => {
  const { t } = useTranslation('pregnancy');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">{t('temperature.form.dateLabel')}</Label>
        <DatePicker 
          date={date} 
          setDate={setDate} 
          label="" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">{t('temperature.form.timeLabel')}</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default DateTimeInput;
