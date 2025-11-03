
import React, { useEffect } from 'react';
import { FormLabel, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dog } from '@/context/DogsContext';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import DatePicker from '@/components/common/DatePicker';
import { useTranslation } from 'react-i18next';

interface NewLitterFormProps {
  dogs: Dog[];
}

const NewLitterForm: React.FC<NewLitterFormProps> = ({ dogs }) => {
  const { watch, setValue, register } = useFormContext();
  const { t } = useTranslation('litters');
  
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
    console.log("Date change in NewLitterForm:", date);
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
        <FormLabel>{t('dialog.newLitterForm.labels.litterName')}</FormLabel>
        <Input 
          {...register("litterName")}
          placeholder={t('dialog.newLitterForm.placeholders.litterName')}
          className="bg-white border-greige-300"
        />
      </FormItem>
      
      <FormItem>
        <FormLabel>{t('dialog.newLitterForm.labels.dateOfBirth')}</FormLabel>
        <DatePicker
          date={dateOfBirth}
          setDate={handleDateChange}
          label=""
          className="w-full"
        />
      </FormItem>
      
      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-greige-300 p-4 bg-white">
        <div className="space-y-0.5">
          <FormLabel>{t('dialog.newLitterForm.labels.externalSire')}</FormLabel>
          <div className="text-sm text-muted-foreground">
            {t('dialog.newLitterForm.labels.externalSireDescription')}
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
            <FormLabel>{t('external.labels.sireName')}</FormLabel>
            <Input 
              {...register("externalSireName")}
              placeholder={t('dialog.newLitterForm.placeholders.sireName')}
              className="bg-white border-greige-300"
            />
          </FormItem>
          
          <FormItem>
            <FormLabel>{t('external.labels.sireBreed')}</FormLabel>
            <Input 
              {...register("externalSireBreed")}
              placeholder={t('dialog.newLitterForm.placeholders.sireBreed')}
              className="bg-white border-greige-300"
            />
          </FormItem>
          
          <FormItem>
            <FormLabel>{t('external.labels.registrationNumber')}</FormLabel>
            <Input 
              {...register("externalSireRegistration")}
              placeholder={t('dialog.newLitterForm.placeholders.registrationOptional')}
              className="bg-white border-greige-300"
            />
          </FormItem>
        </>
      ) : (
        <FormItem>
          <FormLabel>{t('dialog.newLitterForm.labels.sire')}</FormLabel>
          <Select 
            onValueChange={handleSireChange} 
            value={selectedSireId || ""}
          >
            <SelectTrigger className="bg-white border-greige-300">
              <SelectValue placeholder={t('dialog.newLitterForm.placeholders.selectMale')} />
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
        <FormLabel>{t('dialog.newLitterForm.labels.dam')}</FormLabel>
        <Select 
          onValueChange={handleDamChange} 
          value={selectedDamId || ""}
        >
          <SelectTrigger className="bg-white border-greige-300">
            <SelectValue placeholder={t('dialog.newLitterForm.placeholders.selectFemale')} />
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
