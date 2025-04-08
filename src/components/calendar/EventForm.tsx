import React from 'react';
import { Dog } from '@/context/DogsContext';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from '@/components/common/DatePicker';
import TimePicker from '@/components/common/TimePicker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AddEventFormValues {
  title: string;
  date: Date | null;
  time?: string;
  notes?: string;
  dogId?: string;
}

const addEventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().optional(),
  notes: z.string().optional(),
  dogId: z.string().optional(),
});

interface EventFormProps {
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => void;
  defaultValues?: AddEventFormValues;
  submitLabel?: string;
}

const EventForm: React.FC<EventFormProps> = ({ dogs, onSubmit, defaultValues, submitLabel = "Add Event" }) => {
  const form = useForm<AddEventFormValues>({
    resolver: zodResolver(addEventFormSchema),
    defaultValues: defaultValues || {
      title: '',
      date: null,
      time: '',
      notes: '',
      dogId: ''
    },
  });
  
  const { control, handleSubmit, formState } = form;
  const { errors } = formState;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input 
              id="title" 
              placeholder="Event Title" 
              {...field} 
              className={cn(errors.title ? "border-destructive" : "")}
            />
          )}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                date={field.value}
                setDate={field.onChange}
                label=""
              />
            )}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="time">Time</Label>
          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <TimePicker
                time={field.value || ''}
                setTime={field.onChange}
                label=""
              />
            )}
          />
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea 
              id="notes" 
              placeholder="Additional notes" 
              {...field} 
            />
          )}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="dogId">Dog</Label>
        <Controller
          name="dogId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a dog" />
              </SelectTrigger>
              <SelectContent>
                {dogs.map((dog) => (
                  <SelectItem key={dog.id} value={dog.id}>
                    {dog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.dogId && (
          <p className="text-sm text-destructive">{errors.dogId.message}</p>
        )}
      </div>
      
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
};

export default EventForm;
