
import React, { useEffect } from 'react';
import { FormLabel, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dog } from '@/context/DogsContext';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import DatePicker from '@/components/common/DatePicker';

interface NewLitterFormProps {
  dogs: Dog[];
}

const NewLitterForm: React.FC<NewLitterFormProps> = ({ dogs }) => {
  const { watch, setValue, register } = useFormContext();
  
  const isExternalSire = watch("isExternalSire");
  const selectedDamId = watch("damId");
  const selectedSireId = watch("sireId");
  const dateOfBirth = watch("dateOfBirth");
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  // Handle sire selection
  const handleSireChange = (selectedSireId: string) => {
    setValue("sireId", selectedSireId);
    const selectedSire = dogs.find(dog => dog.id === selectedSireId);
    if (selectedSire) {
      console.log("Selected sire:", selectedSire.name, "with ID:", selectedSireId);
    }
  };
  
  // Handle dam selection
  const handleDamChange = (selectedDamId: string) => {
    setValue("damId", selectedDamId);
    const selectedDam = dogs.find(dog => dog.id === selectedDamId);
    if (selectedDam) {
      console.log("Selected dam:", selectedDam.name, "with ID:", selectedDamId);
    }
  };
  
  // Handle date change
  const handleDateChange = (date: Date) => {
    setValue("dateOfBirth", date);
  };

  // Clear internal sire data when switching to external sire
  useEffect(() => {
    if (isExternalSire) {
      setValue("sireId", "");
    } else {
      setValue("externalSireName", "");
      setValue("externalSireBreed", "");
      setValue("externalSireRegistration", "");
    }
  }, [isExternalSire, setValue]);

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Litter Name</FormLabel>
        <Input 
          {...register("litterName")}
          placeholder="Enter litter name"
          className="bg-white border-greige-300"
        />
      </FormItem>
      
      <FormItem>
        <FormLabel>Date of Birth</FormLabel>
        <DatePicker
          date={dateOfBirth}
          setDate={handleDateChange}
          label=""
          className="w-full"
        />
      </FormItem>
      
      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-greige-300 p-4 bg-white">
        <div className="space-y-0.5">
          <FormLabel>External Sire</FormLabel>
          <div className="text-sm text-muted-foreground">
            Use a sire from outside your kennel
          </div>
        </div>
        <Switch
          checked={watch("isExternalSire")}
          onCheckedChange={(checked) => setValue("isExternalSire", checked)}
        />
      </FormItem>
      
      {isExternalSire ? (
        <>
          <FormItem>
            <FormLabel>External Sire Name</FormLabel>
            <Input 
              {...register("externalSireName")}
              placeholder="Enter sire name"
              className="bg-white border-greige-300"
            />
          </FormItem>
          
          <FormItem>
            <FormLabel>External Sire Breed</FormLabel>
            <Input 
              {...register("externalSireBreed")}
              placeholder="Enter sire breed"
              className="bg-white border-greige-300"
            />
          </FormItem>
          
          <FormItem>
            <FormLabel>External Sire Registration</FormLabel>
            <Input 
              {...register("externalSireRegistration")}
              placeholder="Enter registration number (optional)"
              className="bg-white border-greige-300"
            />
          </FormItem>
        </>
      ) : (
        <FormItem>
          <FormLabel>Sire (Male)</FormLabel>
          <Select 
            onValueChange={handleSireChange} 
            value={selectedSireId || ""}
          >
            <SelectTrigger className="bg-white border-greige-300">
              <SelectValue placeholder="Select male dog" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {males.map(dog => (
                  <SelectItem key={dog.id} value={dog.id}>
                    {dog.name} ({dog.breed})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormItem>
      )}
      
      <FormItem>
        <FormLabel>Dam (Female)</FormLabel>
        <Select 
          onValueChange={handleDamChange} 
          value={selectedDamId || ""}
        >
          <SelectTrigger className="bg-white border-greige-300">
            <SelectValue placeholder="Select female dog" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {females.map(dog => (
                <SelectItem key={dog.id} value={dog.id}>
                  {dog.name} ({dog.breed})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormItem>
    </div>
  );
};

export default NewLitterForm;
