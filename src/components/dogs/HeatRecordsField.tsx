import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useSupabaseDogs } from '@/context/dogs';

interface HeatDate {
  date: Date;
  id?: string;
}

interface HeatRecordsFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const HeatRecordsField: React.FC<HeatRecordsFieldProps> = ({ form, disabled }) => {
  const { activeDog, addHeatDate, removeHeatDate } = useSupabaseDogs();
  
  if (form.getValues('gender') === 'male') {
    return null;
  }
  
  const heatHistory = form.watch('heatHistory') || [];
  
  const addNewHeatDate = () => {
    const newHeatHistory = [...heatHistory, { date: new Date() }];
    form.setValue('heatHistory', newHeatHistory, { shouldValidate: true });
    
    if (activeDog) {
      addHeatDate(activeDog.id, new Date());
    }
  };
  
  const removeHeatDateRecord = (index: number, heatRecord: HeatDate) => {
    const newHeatHistory = [...heatHistory];
    newHeatHistory.splice(index, 1);
    form.setValue('heatHistory', newHeatHistory, { shouldValidate: true });
    
    if (activeDog && heatRecord.id) {
      removeHeatDate(heatRecord.id);
    }
  };
  
  const updateHeatDate = (index: number, date: Date) => {
    const newHeatHistory = [...heatHistory];
    newHeatHistory[index] = { ...newHeatHistory[index], date };
    form.setValue('heatHistory', newHeatHistory, { shouldValidate: true });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label>Heat Cycles History</Label>
        
        <div className="space-y-2">
          {heatHistory.length > 0 ? (
            <div className="space-y-2">
              {heatHistory.map((heat: HeatDate, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !heat.date && "text-muted-foreground"
                        )}
                        disabled={disabled}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {heat.date ? format(heat.date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={heat.date}
                        onSelect={(date) => date && updateHeatDate(index, date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeatDateRecord(index, heat)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No heat cycles recorded</div>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewHeatDate}
            className="mt-2"
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Heat Date
          </Button>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="heatInterval"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Heat Interval (days)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="180"
                {...field}
                value={field.value || ''}
                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default HeatRecordsField;
