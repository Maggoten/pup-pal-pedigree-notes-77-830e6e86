
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dog } from '@/context/DogsContext';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { usePlannedLitterHeatDate } from '@/hooks/usePlannedLitterHeatDate';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface DamSelectorProps {
  form: UseFormReturn<PlannedLitterFormValues>;
  females: Dog[];
}

const DamSelector: React.FC<DamSelectorProps> = ({ form, females }) => {
  const { t } = useTranslation('plannedLitters');
  const { calculateHeatDate } = usePlannedLitterHeatDate();
  const [isCalculating, setIsCalculating] = useState(false);

  // When female dog selection changes, try to pre-fill the expected heat date
  const handleDamChange = async (femaleId: string) => {
    // Update the form with the selected female ID
    form.setValue('femaleId', femaleId);
    
    // Find the selected female dog
    const selectedDog = females.find(dog => dog.id === femaleId);
    
    if (selectedDog) {
      // Set female name
      form.setValue('femaleName', selectedDog.name);
      
      // Calculate the next expected heat date using unified data
      setIsCalculating(true);
      try {
        const nextHeatDate = await calculateHeatDate(femaleId);
        
        // If we have a predicted next heat date, pre-fill the form field
        if (nextHeatDate) {
          form.setValue('expectedHeatDate', nextHeatDate);
        }
      } catch (error) {
        console.error('Error calculating heat date:', error);
      } finally {
        setIsCalculating(false);
      }
    }
  };
  
  return (
    <FormField
      control={form.control}
      name="femaleId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('labels.damFemale')}</FormLabel>
          <Select 
            onValueChange={handleDamChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="bg-white border-greige-300">
                {isCalculating ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('loading.calculatingHeatDate', 'Calculating heat date...')}
                  </span>
                ) : (
                  <SelectValue placeholder={t('placeholders.selectFemale')} />
                )}
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
