
import React, { useState, useEffect } from 'react';
import { FormLabel, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dog } from '@/context/DogsContext';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewLitterFormProps {
  dogs: Dog[];
  sireName: string;
  setSireName: (name: string) => void;
  sireId: string;
  setSireId: (id: string) => void;
  damName: string;
  setDamName: (name: string) => void;
  damId: string;
  setDamId: (id: string) => void;
  litterName: string;
  setLitterName: (name: string) => void;
  dateOfBirth: Date;
  setDateOfBirth: (date: Date) => void;
  isExternalSire: boolean;
  setIsExternalSire: (value: boolean) => void;
  externalSireName: string;
  setExternalSireName: (name: string) => void;
  externalSireBreed: string;
  setExternalSireBreed: (breed: string) => void;
  externalSireRegistration: string;
  setExternalSireRegistration: (reg: string) => void;
}

const NewLitterForm: React.FC<NewLitterFormProps> = ({
  dogs,
  sireName,
  setSireName,
  sireId,
  setSireId,
  damName,
  setDamName,
  damId,
  setDamId,
  litterName,
  setLitterName,
  dateOfBirth,
  setDateOfBirth,
  isExternalSire,
  setIsExternalSire,
  externalSireName,
  setExternalSireName,
  externalSireBreed,
  setExternalSireBreed,
  externalSireRegistration,
  setExternalSireRegistration
}) => {
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  const handleSireChange = (selectedSireId: string) => {
    setSireId(selectedSireId);
    const selectedSire = dogs.find(dog => dog.id === selectedSireId);
    if (selectedSire) {
      setSireName(selectedSire.name);
      console.log("Selected sire:", selectedSire.name, "with ID:", selectedSireId);
    }
  };
  
  const handleDamChange = (selectedDamId: string) => {
    setDamId(selectedDamId);
    const selectedDam = dogs.find(dog => dog.id === selectedDamId);
    if (selectedDam) {
      setDamName(selectedDam.name);
    }
  };

  // Clear internal sire data when switching to external sire
  useEffect(() => {
    if (isExternalSire) {
      setSireId('');
      setSireName('');
    } else {
      setExternalSireName('');
      setExternalSireBreed('');
      setExternalSireRegistration('');
    }
  }, [isExternalSire]);

  return (
    <form className="space-y-4">
      <FormItem>
        <FormLabel>Litter Name</FormLabel>
        <Input 
          value={litterName}
          onChange={(e) => setLitterName(e.target.value)}
          placeholder="Enter litter name"
          className="bg-white border-greige-300"
        />
      </FormItem>
      
      <FormItem>
        <FormLabel>Date of Birth</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-white border-greige-300",
                !dateOfBirth && "text-muted-foreground"
              )}
            >
              {dateOfBirth ? (
                format(dateOfBirth, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              mode="single"
              selected={dateOfBirth}
              onSelect={(date) => date && setDateOfBirth(date)}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FormItem>
      
      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-greige-300 p-4 bg-white">
        <div className="space-y-0.5">
          <FormLabel>External Sire</FormLabel>
          <div className="text-sm text-muted-foreground">
            Use a sire from outside your kennel
          </div>
        </div>
        <Switch
          checked={isExternalSire}
          onCheckedChange={setIsExternalSire}
        />
      </FormItem>
      
      {isExternalSire ? (
        <>
          <FormItem>
            <FormLabel>External Sire Name</FormLabel>
            <Input 
              value={externalSireName}
              onChange={(e) => setExternalSireName(e.target.value)}
              placeholder="Enter sire name"
              className="bg-white border-greige-300"
            />
          </FormItem>
          
          <FormItem>
            <FormLabel>External Sire Breed</FormLabel>
            <Input 
              value={externalSireBreed}
              onChange={(e) => setExternalSireBreed(e.target.value)}
              placeholder="Enter sire breed"
              className="bg-white border-greige-300"
            />
          </FormItem>
          
          <FormItem>
            <FormLabel>External Sire Registration</FormLabel>
            <Input 
              value={externalSireRegistration}
              onChange={(e) => setExternalSireRegistration(e.target.value)}
              placeholder="Enter registration number (optional)"
              className="bg-white border-greige-300"
            />
          </FormItem>
        </>
      ) : (
        <FormItem>
          <FormLabel>Sire (Male)</FormLabel>
          <Select onValueChange={handleSireChange} value={sireId}>
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
        <Select onValueChange={handleDamChange} value={damId}>
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
    </form>
  );
};

export default NewLitterForm;
