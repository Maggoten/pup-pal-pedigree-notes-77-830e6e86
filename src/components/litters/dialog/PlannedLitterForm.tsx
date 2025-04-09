
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatePicker from '@/components/common/DatePicker';
import { PlannedLitter } from '@/types/breeding';

interface PlannedLitterFormProps {
  plannedLitters: PlannedLitter[];
  litterName: string;
  setLitterName: (name: string) => void;
  selectedPlannedLitterId: string;
  setSelectedPlannedLitterId: (id: string) => void;
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
  onSubmit: (e: React.FormEvent) => void;
}

const PlannedLitterForm: React.FC<PlannedLitterFormProps> = ({
  plannedLitters,
  litterName,
  setLitterName,
  selectedPlannedLitterId,
  setSelectedPlannedLitterId,
  dateOfBirth,
  setDateOfBirth,
  isExternalSire,
  setIsExternalSire,
  externalSireName,
  setExternalSireName,
  externalSireBreed,
  setExternalSireBreed,
  externalSireRegistration,
  setExternalSireRegistration,
  onSubmit,
}) => {
  if (plannedLitters.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No planned litters available.</p>
        <p className="text-sm mt-2">Create a planned litter first in the Planned Litters section.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="plannedLitter">Select Planned Litter</Label>
        <select
          id="plannedLitter"
          className="flex h-10 w-full rounded-md border border-greige-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedPlannedLitterId}
          onChange={(e) => setSelectedPlannedLitterId(e.target.value)}
        >
          <option value="">Select a planned litter</option>
          {plannedLitters.map(litter => (
            <option key={litter.id} value={litter.id}>
              {litter.maleName} × {litter.femaleName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="plannedLitterName">Litter Name</Label>
        <Input 
          id="plannedLitterName" 
          value={litterName} 
          onChange={(e) => setLitterName(e.target.value)} 
          placeholder="Spring Litter 2025"
          className="bg-white border-greige-300" 
        />
      </div>

      <DatePicker 
        date={dateOfBirth} 
        setDate={setDateOfBirth} 
        label="Date of Birth" 
      />
    </form>
  );
};

export default PlannedLitterForm;
