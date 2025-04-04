
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Trash2 } from 'lucide-react';
import { SymptomRecord } from './types';

interface SymptomItemProps {
  record: SymptomRecord;
  onDelete: (id: string) => void;
}

const SymptomItem: React.FC<SymptomItemProps> = ({ record, onDelete }) => {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <MessageSquare className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium">{record.title}</span>
              <span className="text-sm text-muted-foreground">
                {format(record.date, 'PPP')}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              {record.description}
            </p>
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
    </div>
  );
};

export default SymptomItem;
