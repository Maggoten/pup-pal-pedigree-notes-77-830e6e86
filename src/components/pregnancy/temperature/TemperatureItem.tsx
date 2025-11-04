
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Thermometer, Trash2, Edit2, Check, X } from 'lucide-react';
import { TemperatureRecord } from './types';

interface TemperatureItemProps {
  record: TemperatureRecord;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<TemperatureRecord, 'id'>>) => void;
}

const TemperatureItem: React.FC<TemperatureItemProps> = ({ record, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTemperature, setEditTemperature] = useState(record.temperature.toString());
  const [editNotes, setEditNotes] = useState(record.notes || '');
  const [editDate, setEditDate] = useState(record.date);
  const [editTime, setEditTime] = useState(
    format(record.date, 'HH:mm')
  );

  const handleSave = () => {
    const tempValue = parseFloat(editTemperature);
    if (isNaN(tempValue)) return;
    
    // Combine date and time
    const combinedDate = new Date(editDate);
    const [hours, minutes] = editTime.split(':');
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    onUpdate(record.id, { 
      date: combinedDate,
      temperature: tempValue, 
      notes: editNotes || undefined 
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTemperature(record.temperature.toString());
    setEditNotes(record.notes || '');
    setEditDate(record.date);
    setEditTime(format(record.date, 'HH:mm'));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <div className={`rounded-lg border p-3 bg-white ${
      isEditing ? 'flex flex-col' : 'flex items-start justify-between'
    }`}>
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">
          <Thermometer className="h-5 w-5 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2 mb-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={editTemperature}
                  onChange={(e) => setEditTemperature(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="font-medium h-8 w-20"
                  autoFocus
                />
                <span className="font-medium">°C</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={format(editDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEditDate(new Date(e.target.value))}
                  className="text-sm h-8"
                />
                <Input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="text-sm h-8 w-28"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{record.temperature}°C</span>
              <span className="text-sm text-muted-foreground">
                {format(record.date, 'PPP HH:mm')}
              </span>
            </div>
          )}
          {isEditing ? (
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm text-muted-foreground mt-1 min-h-[60px]"
              placeholder="Notes (optional)..."
            />
          ) : (
            record.notes && (
              <p className="text-sm text-muted-foreground mt-1">
                {record.notes}
              </p>
            )
          )}
        </div>
      </div>
      <div className={`flex items-center gap-1 ${
        isEditing ? 'mt-2 justify-end' : 'ml-2'
      }`}>
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="h-8 w-8"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(record.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TemperatureItem;
