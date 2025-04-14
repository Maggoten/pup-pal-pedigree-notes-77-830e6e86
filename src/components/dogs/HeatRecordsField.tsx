
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Trash, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { DogFormValues } from './schema/dogFormSchema';
import { useDogs } from '@/hooks/useDogs';
import { cn } from '@/lib/utils';

interface HeatRecordsFieldProps {
  form: UseFormReturn<DogFormValues>;
}

const HeatRecordsField: React.FC<HeatRecordsFieldProps> = ({ form }) => {
  const { addHeatRecord, deleteHeatRecord, fetchDogHeatRecords } = useDogs();
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isRemovingRecord, setIsRemovingRecord] = useState<string | null>(null);
  
  // Instead of trying to get a non-existent 'id' from the form values,
  // we'll pass the active dog ID as a prop when needed or store it in state
  // For now, we'll use a placeholder string for new dogs
  const activeDogId = form.getValues().id as string || '';
  
  const { data: heatRecords = [], isLoading: isLoadingRecords } = 
    fetchDogHeatRecords(activeDogId || '');
  
  const handleAddRecord = async () => {
    if (!newDate || !activeDogId) return;
    
    try {
      setIsAddingRecord(true);
      await addHeatRecord(activeDogId, newDate);
      setNewDate(undefined);
    } catch (error) {
      console.error("Error adding heat record:", error);
    } finally {
      setIsAddingRecord(false);
    }
  };
  
  const handleRemoveRecord = async (id: string) => {
    try {
      setIsRemovingRecord(id);
      await deleteHeatRecord(id);
    } catch (error) {
      console.error("Error removing heat record:", error);
    } finally {
      setIsRemovingRecord(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Heat Interval (days)</h3>
        <Input
          type="number"
          {...form.register('heatInterval')}
          placeholder="e.g., 180"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Average number of days between heat cycles
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Heat Records</h3>
        
        {isLoadingRecords ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Loading records...</span>
          </div>
        ) : heatRecords.length > 0 ? (
          <ul className="space-y-2">
            {heatRecords.map((record) => (
              <li key={record.id} className="flex items-center justify-between border p-2 rounded-md">
                <span>{format(new Date(record.date), 'PPP')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRecord(record.id)}
                  disabled={isRemovingRecord === record.id}
                >
                  {isRemovingRecord === record.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm mb-4">No heat records added yet</p>
        )}
        
        <div className="flex gap-2 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newDate ? format(newDate, 'PPP') : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="secondary" 
            onClick={handleAddRecord} 
            disabled={!newDate || isAddingRecord || !activeDogId}
          >
            {isAddingRecord ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Record
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeatRecordsField;
