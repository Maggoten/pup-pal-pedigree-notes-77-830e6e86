import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDogs } from '@/context/DogsContext';
import { useToast } from '@/hooks/use-toast';
import { plannedLitterService } from '@/services/PlannedLitterService';
import { Litter, PlannedLitter } from '@/types/breeding';
import NewLitterForm from './dialog/NewLitterForm';
import PlannedLitterForm from './dialog/PlannedLitterForm';

interface AddLitterDialogProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
  plannedLitters: PlannedLitter[];
}

const AddLitterDialog: React.FC<AddLitterDialogProps> = ({ onClose, onLitterAdded, plannedLitters }) => {
  const { dogs } = useDogs();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('newLitter');
  
  // New litter form state
  const [sireName, setSireName] = useState('');
  const [sireId, setSireId] = useState('');
  const [damName, setDamName] = useState('');
  const [damId, setDamId] = useState('');
  const [litterName, setLitterName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  
  // Planned litter form state
  const [selectedPlannedLitterId, setSelectedPlannedLitterId] = useState('');
  const [plannedLitterName, setPlannedLitterName] = useState('');
  const [plannedDateOfBirth, setPlannedDateOfBirth] = useState<Date>(new Date());
  
  // External sire state
  const [isExternalSire, setIsExternalSire] = useState(false);
  const [externalSireName, setExternalSireName] = useState('');
  const [externalSireBreed, setExternalSireBreed] = useState('');
  const [externalSireRegistration, setExternalSireRegistration] = useState('');

  const handleNewLitterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!litterName || (!sireId && !isExternalSire) || !damId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newLitterId = Date.now().toString();
      const newLitter: Litter = {
        id: newLitterId,
        name: litterName,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        sireId: isExternalSire ? `external-${Date.now()}` : sireId,
        damId,
        sireName: isExternalSire ? externalSireName : sireName,
        damName,
        puppies: []
      };
      
      if (isExternalSire) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = externalSireBreed;
        (newLitter as any).externalSireRegistration = externalSireRegistration;
      }
      
      onLitterAdded(newLitter);
      onClose();
      
      toast({
        title: "Success",
        description: `Litter "${litterName}" has been created`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create litter",
        variant: "destructive"
      });
    }
  };

  const handlePlannedLitterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlannedLitterId || !plannedLitterName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const selectedLitter = plannedLitters.find(
        litter => litter.id === selectedPlannedLitterId
      );
      
      if (!selectedLitter) {
        throw new Error("Selected litter not found");
      }
      
      const newLitterId = Date.now().toString();
      const newLitter: Litter = {
        id: newLitterId,
        name: plannedLitterName,
        dateOfBirth: plannedDateOfBirth.toISOString().split('T')[0],
        sireId: selectedLitter.externalMale ? `external-${selectedLitter.id}` : selectedLitter.maleId,
        damId: selectedLitter.femaleId,
        sireName: selectedLitter.maleName,
        damName: selectedLitter.femaleName,
        puppies: []
      };
      
      if (selectedLitter.externalMale) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = selectedLitter.externalMaleBreed;
        (newLitter as any).externalSireRegistration = selectedLitter.externalMaleRegistration;
      }
      
      onLitterAdded(newLitter);
      onClose();
      
      toast({
        title: "Success",
        description: `Litter "${plannedLitterName}" has been created from planned litter`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create litter from planned litter",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>Add New Litter</DialogTitle>
        <DialogDescription>
          Create a new litter record for your breeding program
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="newLitter">New Litter</TabsTrigger>
          <TabsTrigger value="plannedLitter">From Planned Litter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="newLitter" className="space-y-4 mt-4">
          <NewLitterForm 
            dogs={dogs}
            sireName={sireName}
            setSireName={setSireName}
            sireId={sireId}
            setSireId={setSireId}
            damName={damName}
            setDamName={setDamName}
            damId={damId}
            setDamId={setDamId}
            litterName={litterName}
            setLitterName={setLitterName}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            isExternalSire={isExternalSire}
            setIsExternalSire={setIsExternalSire}
            externalSireName={externalSireName}
            setExternalSireName={setExternalSireName}
            externalSireBreed={externalSireBreed}
            setExternalSireBreed={setExternalSireBreed}
            externalSireRegistration={externalSireRegistration}
            setExternalSireRegistration={setExternalSireRegistration}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleNewLitterSubmit}>
              Create Litter
            </Button>
          </DialogFooter>
        </TabsContent>
        
        <TabsContent value="plannedLitter" className="space-y-4">
          <PlannedLitterForm 
            plannedLitters={plannedLitters}
            litterName={plannedLitterName}
            setLitterName={setPlannedLitterName}
            selectedPlannedLitterId={selectedPlannedLitterId}
            setSelectedPlannedLitterId={setSelectedPlannedLitterId}
            dateOfBirth={plannedDateOfBirth}
            setDateOfBirth={setPlannedDateOfBirth}
            isExternalSire={isExternalSire}
            setIsExternalSire={setIsExternalSire}
            externalSireName={externalSireName}
            setExternalSireName={setExternalSireName}
            externalSireBreed={externalSireBreed}
            setExternalSireBreed={setExternalSireBreed}
            externalSireRegistration={externalSireRegistration}
            setExternalSireRegistration={setExternalSireRegistration}
            onSubmit={handlePlannedLitterSubmit}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePlannedLitterSubmit}>
              Create From Planned Litter
            </Button>
          </DialogFooter>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};

export default AddLitterDialog;
