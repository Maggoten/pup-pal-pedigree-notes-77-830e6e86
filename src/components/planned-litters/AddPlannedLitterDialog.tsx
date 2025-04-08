
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import { Dog } from '@/context/DogsContext';
import { plannedLitterFormSchema, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import BreedDropdown from '@/components/dogs/BreedDropdown';

interface AddPlannedLitterDialogProps {
  males: Dog[];
  females: Dog[];
  onSubmit: (values: PlannedLitterFormValues) => void;
}

const AddPlannedLitterDialog: React.FC<AddPlannedLitterDialogProps> = ({
  males,
  females,
  onSubmit
}) => {
  const form = useForm<PlannedLitterFormValues>({
    resolver: zodResolver(plannedLitterFormSchema),
    defaultValues: {
      maleId: "",
      femaleId: "",
      notes: "",
      externalMale: false,
      externalMaleBreed: "",
      externalMaleRegistration: ""
    }
  });
  
  const isExternalMale = form.watch("externalMale");
  
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add Planned Litter</DialogTitle>
        <DialogDescription>
          Plan a future breeding between dogs
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="femaleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dam (Female)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select female dog" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {females.map(dog => (
                      <SelectItem key={dog.id} value={dog.id}>
                        {dog.name} ({dog.breed})
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
            name="externalMale"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>External Sire</FormLabel>
                  <FormDescription>
                    Select if the sire is not one of your dogs
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {!isExternalMale ? (
            <FormField
              control={form.control}
              name="maleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sire (Male)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select male dog" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {males.map(dog => (
                        <SelectItem key={dog.id} value={dog.id}>
                          {dog.name} ({dog.breed})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="externalMaleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Sire Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter dog name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="externalMaleRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter registration number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="externalMaleBreed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Sire Breed</FormLabel>
                    <FormControl>
                      <BreedDropdown 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <FormField
            control={form.control}
            name="expectedHeatDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expected Heat Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="submit">Add Litter</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddPlannedLitterDialog;
