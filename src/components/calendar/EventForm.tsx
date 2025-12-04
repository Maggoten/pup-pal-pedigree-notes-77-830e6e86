import React from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dog } from '@/context/DogsContext';
import { useTranslation } from 'react-i18next';
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
  submitLabel
}) => {
  const {
    t
  } = useTranslation(['home', 'dogs']);
  const finalSubmitLabel = submitLabel || t('forms.event.addEvent');
  const translateGender = (gender: string) => {
    return gender === 'male' ? t('dogs:form.fields.gender.male') : t('dogs:form.fields.gender.female');
  };
  const form = useForm<AddEventFormValues>({
    defaultValues: defaultValues || {
      title: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      type: 'custom',
      notes: ''
    }
  });
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({
        field
      }) => <FormItem>
              <FormLabel>{t('forms.event.eventTitle')}</FormLabel>
              <FormControl>
                <Input placeholder={t('forms.event.eventTitlePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({
          field
        }) => <FormItem>
                <FormLabel>{t('forms.event.date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        {field.value ? format(field.value, "PP") : <span>{t('forms.event.pickDate')}</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>} />
          
          <FormField control={form.control} name="time" render={({
          field
        }) => <FormItem>
                <FormLabel>{t('forms.event.time')}</FormLabel>
                <div className="flex items-center">
                  <FormControl>
                    <Input type="time" {...field} className="flex-1" />
                  </FormControl>
                  
                </div>
                <FormMessage />
              </FormItem>} />
        </div>
        
        <FormField control={form.control} name="dogId" render={({
        field
      }) => <FormItem>
              <FormLabel>{t('forms.event.associatedDog')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.event.selectDogPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dogs.map(dog => <SelectItem key={dog.id} value={dog.id}>
                      {dog.name} ({translateGender(dog.gender)})
                    </SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />
        
        <FormField control={form.control} name="notes" render={({
        field
      }) => <FormItem>
              <FormLabel>{t('forms.event.notes')}</FormLabel>
              <FormControl>
                <Input placeholder={t('forms.event.notesPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <Button type="submit" className="w-full">{finalSubmitLabel}</Button>
      </form>
    </Form>;
};
export default EventForm;