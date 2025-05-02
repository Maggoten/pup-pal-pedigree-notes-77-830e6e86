
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import DatePicker from '@/components/common/DatePicker';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import { Puppy } from '@/types/breeding';

interface AddPuppyDialogProps {
  onClose: () => void;
  onAddPuppy: (puppy: Puppy) => void;
  puppyNumber?: number;
  litterDob: string;
  damBreed?: string;
}

const AddPuppyDialog: React.FC<AddPuppyDialogProps> = ({ 
  onClose, 
  onAddPuppy, 
  puppyNumber = 1,
  litterDob,
  damBreed = ''
}) => {
  const defaultDob = new Date(litterDob);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [color, setColor] = useState<string>('');
  const [birthWeight, setBirthWeight] = useState<string>('');
  const [timeOfBirth, setTimeOfBirth] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultDob);
  const [breed, setBreed] = useState<string>(damBreed);
  
  useEffect(() => {
    setName(`Puppy ${puppyNumber}`);
  }, [puppyNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create a datetime for birth
      let birthDateTime = new Date(dateOfBirth);
      if (timeOfBirth) {
        const [hours, minutes] = timeOfBirth.split(':').map(Number);
        birthDateTime.setHours(hours, minutes);
      }

      // Generate a unique ID using UUID-like format
      const newId = `puppy-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const weightValue = birthWeight ? parseFloat(birthWeight) : 0;
      
      // Create a weight log entry for birth weight
      const initialWeightLog = [{
        date: dateOfBirth.toISOString().split('T')[0],
        weight: weightValue
      }];

      const newPuppy = {
        id: newId,
        name,
        gender,
        color,
        breed,
        birthWeight: weightValue,
        birthDateTime: birthDateTime.toISOString(),
        imageUrl: '',
        weightLog: initialWeightLog,
        heightLog: [],
        notes: []
      };

      console.log("Adding new puppy:", newPuppy);
      onAddPuppy(newPuppy);
    } catch (error) {
      toast({
        title: "Error Adding Puppy",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add New Puppy</DialogTitle>
          <DialogDescription>
            Add a new puppy to your litter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Puppy name"
              className="bg-white border-greige-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>

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

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
            Cancel
          </Button>
          <Button type="submit">
            Add Puppy
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddPuppyDialog;
