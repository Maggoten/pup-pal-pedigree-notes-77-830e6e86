
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Dog } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLitterService } from '@/services/PlannedLitterService';
import AddLitterDialog from '@/components/litters/AddLitterDialog';
import EmptyLitterState from '@/components/litters/EmptyLitterState';
import LitterDetails from '@/components/litters/LitterDetails';
import LitterSearchForm from '@/components/litters/LitterSearchForm';

const MyLitters: React.FC = () => {
  const [littersData, setLittersData] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  const [plannedLitters, setPlannedLitters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load litters and planned litters on component mount
  useEffect(() => {
    const loadedLitters = litterService.loadLitters();
    if (loadedLitters.length > 0) {
      setLittersData(loadedLitters);
      setSelectedLitterId(loadedLitters[0].id);
    }
    
    const loadedPlannedLitters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(loadedPlannedLitters);
  }, []);
  
  const handleAddLitter = (newLitter: Litter) => {
    // Ensure the new litter has an empty puppies array
    newLitter.puppies = [];
    
    const updatedLitters = litterService.addLitter(newLitter);
    setLittersData(updatedLitters);
    setSelectedLitterId(newLitter.id);
    
    toast({
      title: "Litter Added",
      description: `${newLitter.name} has been added successfully.`
    });
  };
  
  const handleAddPuppy = (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.addPuppy(selectedLitterId, newPuppy);
    setLittersData(updatedLitters);
    
    toast({
      title: "Puppy Added",
      description: `${newPuppy.name} has been added to the litter.`
    });
  };
  
  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.updatePuppy(selectedLitterId, updatedPuppy);
    setLittersData(updatedLitters);
  };
  
  // Filter litters based on search query
  const filteredLitters = littersData.filter(litter => {
    if (!searchQuery.trim()) return true;
    
    const searchTermLower = searchQuery.toLowerCase();
    return (
      litter.name.toLowerCase().includes(searchTermLower) ||
      litter.sireName.toLowerCase().includes(searchTermLower) ||
      litter.damName.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Find the selected litter
  const selectedLitter = selectedLitterId 
    ? filteredLitters.find(litter => litter.id === selectedLitterId) 
    : null;
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<Dog className="h-6 w-6" />}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">My Litters</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <LitterSearchForm 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Litter
              </Button>
            </DialogTrigger>
            <AddLitterDialog 
              onClose={() => setShowAddLitterDialog(false)} 
              onSubmit={handleAddLitter}
              plannedLitters={plannedLitters}
            />
          </Dialog>
        </div>
      </div>
      
      {filteredLitters.length > 0 ? (
        <>
          <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
            <TabsList className="w-full justify-start overflow-auto">
              {filteredLitters.map(litter => (
                <TabsTrigger key={litter.id} value={litter.id}>{litter.name}</TabsTrigger>
              ))}
            </TabsList>
            
            {selectedLitter && (
              <TabsContent value={selectedLitter.id} className="space-y-4">
                <LitterDetails
                  litter={selectedLitter}
                  onAddPuppy={handleAddPuppy}
                  onUpdatePuppy={handleUpdatePuppy}
                />
              </TabsContent>
            )}
          </Tabs>
        </>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No matching litters found</h3>
          <p className="text-muted-foreground">Try adjusting your search term</p>
        </div>
      ) : (
        <EmptyLitterState onAddLitter={() => setShowAddLitterDialog(true)} />
      )}
    </PageLayout>
  );
};

export default MyLitters;
