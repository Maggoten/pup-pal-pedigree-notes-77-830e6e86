
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dog } from '@/context/DogsContext';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { useNextHeatDate } from '@/hooks/useNextHeatDate';

interface DamSelectorProps {
  form: UseFormReturn<PlannedLitterFormValues>;
  females: Dog[];
}

const DamSelector: React.FC<DamSelectorProps> = ({ form, females }) => {
  const { calculateNextHeatDate } = useNextHeatDate();

  // When female dog selection changes, try to pre-fill the expected heat date
  const handleDamChange = (femaleId: string) => {
    // Update the form with the selected female ID
    form.setValue('femaleId', femaleId);
    
    // Find the selected female dog
    const selectedDog = females.find(dog => dog.id === femaleId);
    
    // Calculate the next expected heat date
    const nextHeatDate = calculateNextHeatDate(selectedDog || null);
    
    // If we have a predicted next heat date, pre-fill the form field
    if (nextHeatDate) {
      form.setValue('expectedHeatDate', nextHeatDate);
    }
  };
  
  return (
    <FormField
      control={form.control}
      name="femaleId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dam (Female)</FormLabel>
          <Select 
            onValueChange={handleDamChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="bg-white border-greige-300">
                <SelectValue placeholder="Select female dog" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
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
  );
};

export default DamSelector;
