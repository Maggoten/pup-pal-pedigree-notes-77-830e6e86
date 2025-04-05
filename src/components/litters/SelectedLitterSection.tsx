
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
import { ChartBar, CheckSquare, Layout, Users } from 'lucide-react';
import PuppyGrowthChart from './PuppyGrowthChart';

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
  const [activeTab, setActiveTab] = useState("overview");
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');
  
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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{selectedLitter.name}</h2>
        <div className="text-sm text-muted-foreground">
          Born: {new Date(selectedLitter.dateOfBirth).toLocaleDateString()}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
            <Layout className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="puppies" className="flex items-center gap-2 py-2">
            <Users className="h-4 w-4" />
            <span>Puppies ({selectedLitter.puppies.length})</span>
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2 py-2">
            <CheckSquare className="h-4 w-4" />
            <span>Development</span>
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2 py-2">
            <ChartBar className="h-4 w-4" />
            <span>Growth Charts</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab - Shows litter details and checklist */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
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
            <div>
              {/* Include a compact version of the checklist in the overview */}
              <PuppyDevelopmentChecklist 
                litter={selectedLitter} 
                onToggleItem={handleToggleChecklistItem}
                compact={true}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Puppies Tab - Shows puppy list */}
        <TabsContent value="puppies" className="space-y-4">
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
            selectedPuppy={selectedPuppy}
            damBreed=""
          />
        </TabsContent>
        
        {/* Development Tab - Shows the full development checklist */}
        <TabsContent value="development" className="space-y-4">
          <PuppyDevelopmentChecklist 
            litter={selectedLitter} 
            onToggleItem={handleToggleChecklistItem}
            compact={false}
          />
        </TabsContent>
        
        {/* Growth Charts Tab - Shows growth charts */}
        <TabsContent value="growth" className="space-y-4">
          <div className="flex gap-2 justify-end mb-4">
            <button 
              className={`px-3 py-1.5 text-sm rounded-md ${logType === 'weight' ? 'bg-primary text-white' : 'bg-muted'}`}
              onClick={() => setLogType('weight')}
            >
              Weight
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md ${logType === 'height' ? 'bg-primary text-white' : 'bg-muted'}`}
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
