
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatePicker from '@/components/common/DatePicker';
import { toast } from '@/components/ui/use-toast';
import { useDogs } from '@/context/DogsContext';

interface NewLitterFormProps {
  litterName: string;
  setLitterName: (name: string) => void;
  selectedMaleId: string;
  setSelectedMaleId: (id: string) => void;
  selectedFemaleId: string;
  setSelectedFemaleId: (id: string) => void;
  dateOfBirth: Date;
  setDateOfBirth: (date: Date) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewLitterForm: React.FC<NewLitterFormProps> = ({
  litterName,
  setLitterName,
  selectedMaleId,
  setSelectedMaleId,
  selectedFemaleId,
  setSelectedFemaleId,
  dateOfBirth,
  setDateOfBirth,
  onSubmit,
}) => {
  const { dogs } = useDogs();
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="litterName">Litter Name</Label>
        <Input 
          id="litterName" 
          value={litterName} 
          onChange={(e) => setLitterName(e.target.value)} 
          placeholder="Spring Litter 2025"
        />
      </div>

      <div>
        <Label htmlFor="female">Dam (Female)</Label>
        <select
          id="female"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedFemaleId}
          onChange={(e) => setSelectedFemaleId(e.target.value)}
        >
          <option value="">Select Dam</option>
          {females.map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="male">Sire (Male)</Label>
        <select
          id="male"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedMaleId}
          onChange={(e) => setSelectedMaleId(e.target.value)}
        >
          <option value="">Select Sire</option>
          {males.map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>

      <DatePicker 
        date={dateOfBirth} 
        setDate={setDateOfBirth} 
        label="Date of Birth" 
      />
    </form>
  );
};

export default NewLitterForm;
