
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeatDatePicker from './HeatDatePicker';

interface HeatDateListProps {
  dates: { date: Date }[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, date: Date) => void;
  disabled?: boolean;
}

const HeatDateList: React.FC<HeatDateListProps> = ({ 
  dates, 
  onRemove, 
  onUpdate,
  disabled 
}) => {
  return (
    <div className="space-y-2">
      {dates.map((heat, index) => (
        <div key={index} className="flex items-center gap-2">
          <HeatDatePicker
            date={heat.date}
            onSelect={(date) => onUpdate(index, date)}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default HeatDateList;
