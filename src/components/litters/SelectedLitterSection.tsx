
import React, { useState } from 'react';
import { Litter, Puppy } from '@/types/breeding';
import AddPuppyDialog from './AddPuppyDialog';
import PuppyList from './PuppyList';
import PuppyDetailsDialog from './PuppyDetailsDialog';
import PuppyDevelopmentChecklist from './PuppyDevelopmentChecklist';
import { toast } from '@/components/ui/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { ChartBar, CheckSquare, Users, Edit } from 'lucide-react';
import PuppyGrowthChart from './PuppyGrowthChart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import LitterEditDialog from './LitterEditDialog';
import { differenceInWeeks, parseISO } from 'date-fns';

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
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
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

  // Calculate litter age
  const birthDate = parseISO(selectedLitter.dateOfBirth);
  const ageInWeeks = differenceInWeeks(new Date(), birthDate);
  
  return (
    <div className="mt-6 animate-fade-in space-y-8">
      {/* Header with edit button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{selectedLitter.name}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => setShowEditLitterDialog(true)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Litter</span>
        </Button>
        <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
          <LitterEditDialog 
            litter={selectedLitter}
            onClose={() => setShowEditLitterDialog(false)}
            onUpdate={onUpdateLitter}
            onDelete={onDeleteLitter}
            onArchive={onArchiveLitter}
          />
        </Dialog>
      </div>
      
      {/* 1. Puppy Development Checklist - Compact Version */}
      <PuppyDevelopmentChecklist 
        litter={selectedLitter} 
        onToggleItem={handleToggleChecklistItem}
        compact={true}
      />
      
      {/* 2. Puppies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Puppies ({selectedLitter.puppies.length})</h3>
        </div>
        
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
      </div>
      
      {/* 3. Development Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Development</h3>
        </div>
        
        <PuppyDevelopmentChecklist 
          litter={selectedLitter} 
          onToggleItem={handleToggleChecklistItem}
          compact={false}
        />
      </div>
      
      {/* 4. Growth Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Growth Charts</h3>
          </div>
          
          <div className="flex gap-2 justify-end">
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
        </div>
        
        <PuppyGrowthChart
          selectedPuppy={selectedPuppy}
          puppies={selectedLitter.puppies}
          logType={logType}
          setLogType={setLogType}
        />
      </div>
      
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
