
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Thermometer, Trash2 } from 'lucide-react';
import { TemperatureRecord } from './types';

interface TemperatureItemProps {
  record: TemperatureRecord;
  onDelete: (id: string) => void;
}

const TemperatureItem: React.FC<TemperatureItemProps> = ({ record, onDelete }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 bg-white">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Thermometer className="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{record.temperature}°F</span>
            <span className="text-sm text-muted-foreground">
              {format(record.date, 'PPP')}
            </span>
          </div>
          {record.notes && (
            <p className="text-sm text-muted-foreground mt-1">
              {record.notes}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(record.id)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
};

export default TemperatureItem;
