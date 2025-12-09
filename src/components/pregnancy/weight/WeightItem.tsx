import React from 'react';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { Trash2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeightRecord } from './types';
import { useTranslation } from 'react-i18next';

interface WeightItemProps {
  record: WeightRecord;
  onDelete: (id: string) => void;
}

const WeightItem: React.FC<WeightItemProps> = ({ record, onDelete }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'sv' ? sv : enUS;
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Scale className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{record.weight} kg</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(record.date, 'PPp', { locale })}
          </p>
          {record.notes && (
            <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(record.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeightItem;
