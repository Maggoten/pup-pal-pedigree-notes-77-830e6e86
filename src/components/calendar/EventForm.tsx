
import React from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dog } from '@/context/DogsContext';

export interface AddEventFormValues {
  title: string;
  date: Date;
  time: string;
  type?: string;
  dogId?: string;
  notes?: string;
}

interface EventFormProps {
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => void;
  defaultValues?: Partial<AddEventFormValues>;
  submitLabel?: string;
}

const EventForm: React.FC<EventFormProps> = ({ 
  dogs, 
  onSubmit, 
  defaultValues, 
  submitLabel = "Add Event" 
}) => {
  const form = useForm<AddEventFormValues>({
    defaultValues: defaultValues || {
      title: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      type: 'custom',
      notes: ''
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <div className="flex items-center">
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="flex-1"
                    />
                  </FormControl>
                  <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="dogId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Dog (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dog (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name} ({dog.gender})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Add notes about this event" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">{submitLabel}</Button>
      </form>
    </Form>
  );
};

export default EventForm;
