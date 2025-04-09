
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';

interface ExternalSireFieldsProps {
  externalSireName: string;
  setExternalSireName: (name: string) => void;
  externalSireBreed: string;
  setExternalSireBreed: (breed: string) => void;
  externalSireRegistration: string;
  setExternalSireRegistration: (reg: string) => void;
}

const ExternalSireFields: React.FC<ExternalSireFieldsProps> = ({
  externalSireName,
  setExternalSireName,
  externalSireBreed,
  setExternalSireBreed,
  externalSireRegistration,
  setExternalSireRegistration
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="externalSireName">Name</Label>
        <Input 
          id="externalSireName" 
          value={externalSireName} 
          onChange={(e) => setExternalSireName(e.target.value)}
          placeholder="Enter sire's name" 
        />
      </div>
      
      <div>
        <Label htmlFor="externalSireBreed">Breed</Label>
        <BreedDropdown
          value={externalSireBreed}
          onChange={setExternalSireBreed}
        />
      </div>
      
      <div>
        <Label htmlFor="externalSireRegistration">Registration Number</Label>
        <Input 
          id="externalSireRegistration" 
          value={externalSireRegistration} 
          onChange={(e) => setExternalSireRegistration(e.target.value)}
          placeholder="Enter registration number" 
        />
      </div>
    </div>
  );
};

export default ExternalSireFields;
