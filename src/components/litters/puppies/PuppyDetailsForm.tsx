
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Puppy } from '@/types/breeding';
import DatePicker from '@/components/common/DatePicker';
import BreedDropdown from '@/components/dogs/BreedDropdown';
import PuppyGenderSelector from './PuppyGenderSelector';

interface PuppyDetailsFormProps {
  puppy: Puppy;
  onSubmit: (updatedPuppy: Puppy) => void;
}

const PuppyDetailsForm: React.FC<PuppyDetailsFormProps> = ({ puppy, onSubmit }) => {
  const [name, setName] = useState(puppy.name);
  const [gender, setGender] = useState(puppy.gender);
  const [color, setColor] = useState(puppy.color);
  const [birthWeight, setBirthWeight] = useState(puppy.birthWeight.toString());
  const [breed, setBreed] = useState(puppy.breed || '');
  
  const birthDate = new Date(puppy.birthDateTime);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(birthDate);
  
  const hours = birthDate.getHours().toString().padStart(2, '0');
  const minutes = birthDate.getMinutes().toString().padStart(2, '0');
  const [timeOfBirth, setTimeOfBirth] = useState(`${hours}:${minutes}`);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let birthDateTime = new Date(dateOfBirth);
      if (timeOfBirth) {
        const [hours, minutes] = timeOfBirth.split(':').map(Number);
        birthDateTime.setHours(hours, minutes);
      }

      const updatedPuppy = {
        ...puppy,
        name,
        gender,
        color,
        breed,
        birthWeight: parseFloat(birthWeight),
        birthDateTime: birthDateTime.toISOString(),
      };

      if (parseFloat(birthWeight) !== puppy.birthWeight) {
        const newWeightLog = [...puppy.weightLog];
        const birthWeightEntryIndex = newWeightLog.findIndex(
          log => new Date(log.date).toDateString() === new Date(puppy.birthDateTime).toDateString()
        );
        
        if (birthWeightEntryIndex >= 0) {
          newWeightLog[birthWeightEntryIndex].weight = parseFloat(birthWeight);
        }
        
        updatedPuppy.weightLog = newWeightLog;
      }

      onSubmit(updatedPuppy);
    } catch (error) {
      console.error("Error updating puppy:", error);
    }
  };

  return (
    <form id="puppy-form" onSubmit={handleFormSubmit}>
      <div className="space-y-4 mt-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Puppy name"
          />
        </div>

        <PuppyGenderSelector gender={gender} onGenderChange={setGender} />

        <div>
          <Label htmlFor="breed">Breed</Label>
          <BreedDropdown 
            value={breed} 
            onChange={setBreed}
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input 
            id="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            placeholder="Puppy color"
          />
        </div>

        <div>
          <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
          <Input 
            id="birthWeight" 
            value={birthWeight} 
            onChange={(e) => setBirthWeight(e.target.value)} 
            type="number" 
            step="0.01" 
            placeholder="0.00"
          />
        </div>

        <DatePicker 
          date={dateOfBirth} 
          setDate={setDateOfBirth} 
          label="Date of Birth" 
        />

        <div>
          <Label htmlFor="timeOfBirth">Time of Birth</Label>
          <Input 
            id="timeOfBirth" 
            value={timeOfBirth} 
            onChange={(e) => setTimeOfBirth(e.target.value)} 
            type="time"
          />
        </div>
      </div>
    </form>
  );
};

export default PuppyDetailsForm;
