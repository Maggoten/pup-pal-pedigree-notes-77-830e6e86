
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import DatePicker from '@/components/common/DatePicker';
import { Dog } from '@/context/DogsContext';
import ExternalSireFields from './ExternalSireFields';

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

  const handleSireChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSireId(id);
    
    const selectedDog = males.find(dog => dog.id === id);
    if (selectedDog) {
      setSireName(selectedDog.name);
    } else {
      setSireName('');
    }
  };

  const handleDamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setDamId(id);
    
    const selectedDog = females.find(dog => dog.id === id);
    if (selectedDog) {
      setDamName(selectedDog.name);
    } else {
      setDamName('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="litterName">Litter Name</Label>
        <Input 
          id="litterName" 
          value={litterName} 
          onChange={(e) => setLitterName(e.target.value)}
          placeholder="Spring Litter 2025" 
          className="bg-white border-greige-300"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="external-sire"
          checked={isExternalSire}
          onCheckedChange={setIsExternalSire}
        />
        <Label htmlFor="external-sire">External Sire (not in your dogs)</Label>
      </div>

      {!isExternalSire ? (
        <div>
          <Label htmlFor="sire">Sire (Male)</Label>
          <select
            id="sire"
            className="flex h-10 w-full rounded-md border border-greige-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={sireId}
            onChange={handleSireChange}
          >
            <option value="">Select a male dog</option>
            {males.map(dog => (
              <option key={dog.id} value={dog.id}>
                {dog.name} ({dog.breed})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <ExternalSireFields
          externalSireName={externalSireName}
          setExternalSireName={setExternalSireName}
          externalSireBreed={externalSireBreed}
          setExternalSireBreed={setExternalSireBreed}
          externalSireRegistration={externalSireRegistration}
          setExternalSireRegistration={setExternalSireRegistration}
        />
      )}

      <div>
        <Label htmlFor="dam">Dam (Female)</Label>
        <select
          id="dam"
          className="flex h-10 w-full rounded-md border border-greige-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={damId}
          onChange={handleDamChange}
        >
          <option value="">Select a female dog</option>
          {females.map(dog => (
            <option key={dog.id} value={dog.id}>
              {dog.name} ({dog.breed})
            </option>
          ))}
        </select>
      </div>

      <DatePicker 
        date={dateOfBirth} 
        setDate={setDateOfBirth} 
        label="Date of Birth" 
        className="bg-white border-greige-300"
      />
    </div>
  );
};

export default NewLitterForm;
