
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import DatePicker from '@/components/common/DatePicker';

interface AddPuppyDialogProps {
  onClose: () => void;
  onSubmit: (puppy: any) => void;
  puppyNumber: number;
  litterDob: string;
}

const AddPuppyDialog: React.FC<AddPuppyDialogProps> = ({ 
  onClose, 
  onSubmit, 
  puppyNumber,
  litterDob
}) => {
  const defaultDob = new Date(litterDob);
  const [name, setName] = useState<string>(`Puppy ${puppyNumber}`);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [color, setColor] = useState<string>('');
  const [birthWeight, setBirthWeight] = useState<string>('');
  const [timeOfBirth, setTimeOfBirth] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(defaultDob);
  const [breed, setBreed] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Combine date and time for the time of birth
      let birthDateTime = new Date(dateOfBirth);
      if (timeOfBirth) {
        const [hours, minutes] = timeOfBirth.split(':').map(Number);
        birthDateTime.setHours(hours, minutes);
      }

      const newPuppy = {
        id: Date.now().toString(),
        name,
        gender,
        color,
        breed,
        birthWeight: birthWeight ? parseFloat(birthWeight) : 0,
        birthDateTime: birthDateTime.toISOString(),
        imageUrl: '', // Will be populated later when image is uploaded
        weightLog: [
          { date: dateOfBirth.toISOString().split('T')[0], weight: birthWeight ? parseFloat(birthWeight) : 0 }
        ],
        heightLog: [] // Adding empty height log for consistency with existing code
      };

      onSubmit(newPuppy);
      onClose();
    } catch (error) {
      toast({
        title: "Error Adding Puppy",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
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
            <Input 
              id="breed" 
              value={breed} 
              onChange={(e) => setBreed(e.target.value)} 
              placeholder="Breed"
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

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Puppy</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddPuppyDialog;
