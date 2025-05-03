import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Puppy } from '@/types/breeding';
import DatePicker from '@/components/common/DatePicker';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import PuppyGenderSelector from './PuppyGenderSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';

interface PuppyDetailsFormProps {
  puppy: Puppy;
  onSubmit: (updatedPuppy: Puppy) => void;
}

const PuppyDetailsForm: React.FC<PuppyDetailsFormProps> = ({ puppy, onSubmit }) => {
  // Basic details state
  const [name, setName] = useState(puppy.name);
  const [gender, setGender] = useState(puppy.gender);
  const [color, setColor] = useState(puppy.color);
  const [birthWeight, setBirthWeight] = useState(puppy.birthWeight?.toString() || '');
  const [breed, setBreed] = useState(puppy.breed || '');
  
  // New fields state
  const [registeredName, setRegisteredName] = useState(puppy.registered_name || '');
  const [registrationNumber, setRegistrationNumber] = useState(puppy.registration_number || '');
  const [status, setStatus] = useState<'Available' | 'Reserved' | 'Sold'>(
    puppy.status as 'Available' | 'Reserved' | 'Sold' || 'Available'
  );
  const [buyerName, setBuyerName] = useState(puppy.buyer_name || '');
  const [buyerPhone, setBuyerPhone] = useState(puppy.buyer_phone || '');
  
  // Fix date handling to prevent timezone issues
  const birthDate = puppy.birthDateTime ? new Date(puppy.birthDateTime) : new Date();
  const [dateOfBirth, setDateOfBirth] = useState<Date>(birthDate);
  
  // Preserve the exact time component
  const hours = birthDate.getHours().toString().padStart(2, '0');
  const minutes = birthDate.getMinutes().toString().padStart(2, '0');
  const [timeOfBirth, setTimeOfBirth] = useState(`${hours}:${minutes}`);
  
  // Microchip and collar
  const [microchip, setMicrochip] = useState(puppy.microchip || '');
  const [collar, setCollar] = useState(puppy.collar || '');

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
      
      // Check if status changed from Available to Reserved/Sold
      const statusChanged = puppy.status !== status;

      // Create the updated puppy object with the exact name as entered in the form
      const updatedPuppy = {
        ...puppy,
        name,
        gender,
        color,
        breed,
        birthWeight: birthWeightValue,
        birthDateTime: birthDateTime.toISOString(),
        registered_name: registeredName || null,
        registration_number: registrationNumber || null,
        status,
        buyer_name: (status === 'Reserved' || status === 'Sold') ? buyerName : null,
        buyer_phone: (status === 'Reserved' || status === 'Sold') ? buyerPhone : null,
        microchip,
        collar,
        // Update compatibility fields for backward compatibility
        reserved: status === 'Reserved',
        sold: status === 'Sold',
        newOwner: (status === 'Reserved' || status === 'Sold') ? buyerName : null,
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
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="registered_name">Registered Name</Label>
            <Input 
              id="registered_name" 
              value={registeredName} 
              onChange={(e) => setRegisteredName(e.target.value)} 
              placeholder="Optional registered name"
              className="bg-white border-greige-300"
            />
          </div>
          <div>
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input 
              id="registration_number" 
              value={registrationNumber} 
              onChange={(e) => setRegistrationNumber(e.target.value)} 
              placeholder="Optional registration number"
              className="bg-white border-greige-300"
            />
          </div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="collar">Collar ID</Label>
            <Input 
              id="collar" 
              value={collar} 
              onChange={(e) => setCollar(e.target.value)} 
              placeholder="Collar identifier"
              className="bg-white border-greige-300"
            />
          </div>
          <div>
            <Label htmlFor="microchip">Microchip</Label>
            <Input 
              id="microchip" 
              value={microchip} 
              onChange={(e) => setMicrochip(e.target.value)} 
              placeholder="Microchip number"
              className="bg-white border-greige-300"
            />
          </div>
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

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={status} 
            onValueChange={(value) => setStatus(value as 'Available' | 'Reserved' | 'Sold')}
          >
            <SelectTrigger className="bg-white border-greige-300">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(status === 'Reserved' || status === 'Sold') && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div>
              <Label htmlFor="buyer_name">Buyer Name</Label>
              <Input 
                id="buyer_name" 
                value={buyerName} 
                onChange={(e) => setBuyerName(e.target.value)} 
                placeholder="Buyer's name"
                className="bg-white border-greige-300"
              />
            </div>
            
            <div>
              <Label htmlFor="buyer_phone">Buyer Phone</Label>
              <Input 
                id="buyer_phone" 
                value={buyerPhone} 
                onChange={(e) => setBuyerPhone(e.target.value)} 
                placeholder="Buyer's phone number"
                className="bg-white border-greige-300"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PuppyDetailsForm;
