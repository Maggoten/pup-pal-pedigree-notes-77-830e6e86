
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DateTimeSelectorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime
}) => {
  const { t } = useTranslation('litters');
  return (
    <div className="flex items-center space-x-4">
      <div className="grid gap-1.5 flex-1">
        <Label htmlFor="measurement-date">{t('puppies.labels.date')}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="measurement-time">{t('puppies.labels.time')}</Label>
        <div className="flex items-center">
          <Input
            id="measurement-time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-24"
          />
          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelector;
