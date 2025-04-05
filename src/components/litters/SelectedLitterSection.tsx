
import React, { useState } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import LitterDetails from './LitterDetails';
import AddPuppyDialog from './AddPuppyDialog';
import PuppyList from './PuppyList';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';
import { toast } from '@/components/ui/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar, CheckSquare, Users } from 'lucide-react';
import PuppyGrowthChart from './PuppyGrowthChart';
import { useIsMobile } from '@/hooks/use-mobile';

interface SelectedLitterSectionProps {
  selectedLitter: Litter | null;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const SelectedLitterSection: React.FC<SelectedLitterSectionProps> = ({
  selectedLitter,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy
}) => {
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("puppies");
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');
  const isMobile = useIsMobile();
  
  // If no litter is selected, don't show this section
  if (!selectedLitter) {
    return null;
  }
  
  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? "Item marked as completed" 
        : "Item marked as not completed"
    });
  };
  
  const handleRowSelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
  };
  
  return (
    <div className="mt-6 animate-fade-in">
      <div className="grid md:grid-cols-5 gap-4 mb-4">
        <div className="md:col-span-3">
          <LitterDetails 
            litter={selectedLitter}
            onUpdateLitter={onUpdateLitter}
            onDeleteLitter={onDeleteLitter}
            onArchiveLitter={onArchiveLitter}
            onAddPuppy={onAddPuppy}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
          />
        </div>
        <div className="md:col-span-2">
          <PuppyDevelopmentChecklist 
            litter={selectedLitter} 
            onToggleItem={handleToggleChecklistItem}
            compact={true}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'w-auto inline-flex'} gap-1`}>
          <TabsTrigger value="puppies" className="flex items-center gap-1.5 px-4">
            <Users className="h-4 w-4" />
            <span>Puppies ({selectedLitter.puppies.length})</span>
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-1.5 px-4">
            <CheckSquare className="h-4 w-4" />
            <span>Development</span>
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-1.5 px-4">
            <ChartBar className="h-4 w-4" />
            <span>Growth</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Puppies Tab - Shows puppy list */}
        <TabsContent value="puppies" className="mt-4 animate-fade-in">
          <PuppyList 
            puppies={selectedLitter.puppies}
            onAddPuppy={() => setShowAddPuppyDialog(true)}
            onSelectPuppy={setSelectedPuppy}
            onRowSelect={handleRowSelect}
            onUpdatePuppy={onUpdatePuppy}
            onDeletePuppy={onDeletePuppy}
            showAddPuppyDialog={showAddPuppyDialog}
            setShowAddPuppyDialog={setShowAddPuppyDialog}
            puppyNumber={1}
            litterDob={selectedLitter.dateOfBirth}
            damBreed=""
          />
        </TabsContent>
        
        {/* Development Tab - Shows the full development checklist */}
        <TabsContent value="development" className="mt-4 animate-fade-in">
          <PuppyDevelopmentChecklist 
            litter={selectedLitter} 
            onToggleItem={handleToggleChecklistItem}
            compact={false}
          />
        </TabsContent>
        
        {/* Growth Charts Tab - Shows growth charts */}
        <TabsContent value="growth" className="mt-4 animate-fade-in">
          <div className="flex gap-2 justify-end mb-4">
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'weight' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => setLogType('weight')}
            >
              Weight
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'height' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              onClick={() => setLogType('height')}
            >
              Height
            </button>
          </div>
          
          <PuppyGrowthChart
            selectedPuppy={selectedPuppy}
            puppies={selectedLitter.puppies}
            logType={logType}
            setLogType={setLogType}
          />
        </TabsContent>
      </Tabs>
      
      {/* Add Puppy Dialog - Wrapped in a Dialog component */}
      <Dialog open={showAddPuppyDialog} onOpenChange={setShowAddPuppyDialog}>
        <AddPuppyDialog 
          onClose={() => setShowAddPuppyDialog(false)}
          onSubmit={onAddPuppy}
          puppyNumber={selectedLitter.puppies.length + 1}
          litterDob={selectedLitter.dateOfBirth}
          damBreed=""
        />
      </Dialog>
      
      {/* Puppy Details Dialog - Only render when a puppy is selected, wrapped in Dialog */}
      {selectedPuppy && (
        <Dialog open={showPuppyDetailsDialog} onOpenChange={setShowPuppyDetailsDialog}>
          <PuppyDetailsDialog 
            puppy={selectedPuppy}
            onClose={() => setShowPuppyDetailsDialog(false)}
            onUpdate={onUpdatePuppy}
            onDelete={onDeletePuppy}
          />
        </Dialog>
      )}
    </div>
  );
};

export default SelectedLitterSection;
