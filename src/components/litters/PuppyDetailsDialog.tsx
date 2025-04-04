
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import DatePicker from '@/components/common/DatePicker';
import { Camera, Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Puppy } from '@/types/breeding';
import BreedDropdown from '@/components/dogs/BreedDropdown';

interface PuppyDetailsDialogProps {
  puppy: Puppy;
  onClose: () => void;
  onUpdate: (updatedPuppy: Puppy) => void;
}

const PuppyDetailsDialog: React.FC<PuppyDetailsDialogProps> = ({ 
  puppy, 
  onClose, 
  onUpdate 
}) => {
  const [name, setName] = useState(puppy.name);
  const [gender, setGender] = useState(puppy.gender);
  const [color, setColor] = useState(puppy.color);
  const [birthWeight, setBirthWeight] = useState(puppy.birthWeight.toString());
  const [breed, setBreed] = useState(puppy.breed || '');
  const [imageUrl, setImageUrl] = useState(puppy.imageUrl || '');
  
  const birthDate = new Date(puppy.birthDateTime);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(birthDate);
  
  const hours = birthDate.getHours().toString().padStart(2, '0');
  const minutes = birthDate.getMinutes().toString().padStart(2, '0');
  const [timeOfBirth, setTimeOfBirth] = useState(`${hours}:${minutes}`);

  const handleSubmit = (e: React.FormEvent) => {
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
        imageUrl
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

      onUpdate(updatedPuppy);
      toast({
        title: "Puppy Updated",
        description: `${name} has been updated successfully.`
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error Updating Puppy",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = () => {
    toast({
      title: "Upload Feature Coming Soon",
      description: "Image upload will be available in the next update."
    });
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Puppy Details</DialogTitle>
          <DialogDescription>
            View and edit puppy information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {imageUrl ? (
                  <AvatarImage src={imageUrl} alt={name} />
                ) : (
                  <AvatarFallback className="bg-primary/10">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute -bottom-2 -right-2 rounded-full p-1" 
                onClick={handleImageUpload}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

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

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default PuppyDetailsDialog;
