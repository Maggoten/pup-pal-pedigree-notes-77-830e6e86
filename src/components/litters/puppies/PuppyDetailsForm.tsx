import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Puppy } from '@/types/breeding';
import DatePicker from '@/components/common/DatePicker';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import PuppyGenderSelector from './PuppyGenderSelector';

interface PuppyDetailsFormProps {
  puppy: Puppy;
  onSubmit: (updatedPuppy: Puppy) => void;
}

const PuppyDetailsForm: React.FC<PuppyDetailsFormProps> = ({ puppy, onSubmit }) => {
  // Ensure we're using the exact puppy name without any string manipulation
  const [name, setName] = useState(puppy.name);
  const [gender, setGender] = useState(puppy.gender);
  const [color, setColor] = useState(puppy.color);
  const [birthWeight, setBirthWeight] = useState(puppy.birthWeight?.toString() || '');
  const [breed, setBreed] = useState(puppy.breed || '');
  
  // Fix date handling to prevent timezone issues
  const birthDate = new Date(puppy.birthDateTime || new Date());
  const [dateOfBirth, setDateOfBirth] = useState<Date>(birthDate);
  
  // Preserve the exact time component
  const hours = birthDate.getHours().toString().padStart(2, '0');
  const minutes = birthDate.getMinutes().toString().padStart(2, '0');
  const [timeOfBirth, setTimeOfBirth] = useState(`${hours}:${minutes}`);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create a date at 12:00 noon to avoid timezone issues
      let birthDateTime = new Date(dateOfBirth);
      
      // Preserve the exact hour and minute
      if (timeOfBirth) {
        const [hours, minutes] = timeOfBirth.split(':').map(Number);
        birthDateTime.setHours(hours, minutes);
      }

      const birthWeightValue = birthWeight ? parseFloat(birthWeight) : undefined;

      // Create the updated puppy object with the exact name as entered in the form
      const updatedPuppy = {
        ...puppy,
        name,  // Use the name exactly as entered in the form
        gender,
        color,
        breed,
        birthWeight: birthWeightValue,
        birthDateTime: birthDateTime.toISOString(),
      };

      // Update weight log if birth weight has changed
      if (birthWeightValue !== undefined && birthWeightValue !== puppy.birthWeight) {
        console.log(`Birth weight changed from ${puppy.birthWeight} to ${birthWeightValue}`);
        
        // First, create a new weightLog array from the existing one
        const newWeightLog = [...puppy.weightLog];
        
        // Find if there's an existing entry for the birth date
        const birthWeightEntryIndex = newWeightLog.findIndex(
          log => {
            const logDate = new Date(log.date).toISOString().split('T')[0];
            const birthDate = birthDateTime ? new Date(birthDateTime).toISOString().split('T')[0] : null;
            return logDate === birthDate;
          }
        );
        
        // If we found a matching entry, update it
        if (birthWeightEntryIndex >= 0) {
          console.log(`Updating existing weight log entry at index ${birthWeightEntryIndex}`);
          newWeightLog[birthWeightEntryIndex].weight = birthWeightValue;
        } else {
          // Otherwise, add a new entry for this birth date
          console.log('Adding new birth weight log entry');
          newWeightLog.push({
            date: birthDateTime.toISOString(),
            weight: birthWeightValue
          });
        }
        
        // Update the puppy object with the new weight log
        updatedPuppy.weightLog = newWeightLog;
      }

      console.log("Submitting updated puppy:", updatedPuppy);
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
            className="bg-white border-greige-300"
          />
        </div>

        <PuppyGenderSelector gender={gender} onGenderChange={setGender} />

        <div>
          <Label htmlFor="breed">Breed</Label>
          <BreedDropdown 
            value={breed} 
            onChange={setBreed}
            className="bg-white border-greige-300"
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input 
            id="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            placeholder="Puppy color"
            className="bg-white border-greige-300"
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
            className="bg-white border-greige-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <DatePicker 
            date={dateOfBirth} 
            setDate={setDateOfBirth}
            className="bg-white border-greige-300"
          />
        </div>

        <div>
          <Label htmlFor="timeOfBirth">Time of Birth</Label>
          <Input 
            id="timeOfBirth" 
            value={timeOfBirth} 
            onChange={(e) => setTimeOfBirth(e.target.value)} 
            type="time"
            className="bg-white border-greige-300"
          />
        </div>
      </div>
    </form>
  );
};

export default PuppyDetailsForm;
