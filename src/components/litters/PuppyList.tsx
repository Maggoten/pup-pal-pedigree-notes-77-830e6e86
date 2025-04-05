
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Puppy } from '@/types/breeding';
import AddPuppyDialog from './AddPuppyDialog';
import PuppyMeasurementsDialog from './puppies/PuppyMeasurementsDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PuppyListProps {
  puppies: Puppy[];
  onAddPuppy: (puppy: Puppy) => void;
  onSelectPuppy: (puppy: Puppy) => void;
  onRowSelect: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  showAddPuppyDialog: boolean;
  setShowAddPuppyDialog: (show: boolean) => void;
  puppyNumber: number;
  litterDob: string;
  selectedPuppy: Puppy | null;
  damBreed?: string; // Add the dam's breed as an optional prop
}

const PuppyList: React.FC<PuppyListProps> = ({
  puppies,
  onAddPuppy,
  onSelectPuppy,
  onRowSelect,
  onUpdatePuppy,
  onDeletePuppy,
  showAddPuppyDialog,
  setShowAddPuppyDialog,
  puppyNumber,
  litterDob,
  selectedPuppy,
  damBreed
}) => {
  const [activePuppy, setActivePuppy] = useState<Puppy | null>(null);
  const [showMeasurementsDialog, setShowMeasurementsDialog] = useState(false);

  const handleNameClick = (puppy: Puppy) => {
    setActivePuppy(puppy);
    onSelectPuppy(puppy);
  };

  const handleEditClick = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setShowMeasurementsDialog(true);
  };

  // Function to get the current/latest weight of a puppy
  const getCurrentWeight = (puppy: Puppy): string => {
    if (!puppy.weightLog || puppy.weightLog.length === 0) {
      return puppy.birthWeight.toString();
    }
    
    // Sort weight log by date (newest first)
    const sortedLog = [...puppy.weightLog].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Return the most recent weight
    return sortedLog[0].weight.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Puppies ({puppies.length})</h3>
        <Dialog open={showAddPuppyDialog} onOpenChange={setShowAddPuppyDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Puppy
            </Button>
          </DialogTrigger>
          <AddPuppyDialog 
            onClose={() => setShowAddPuppyDialog(false)} 
            onSubmit={onAddPuppy}
            puppyNumber={puppyNumber + puppies.length}
            litterDob={litterDob}
            damBreed={damBreed} // Pass the dam's breed to the dialog
          />
        </Dialog>
      </div>
      
      {puppies.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Birth Weight</TableHead>
              <TableHead>Current Weight</TableHead>
              <TableHead>Height/Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {puppies.map(puppy => (
              <TableRow 
                key={puppy.id} 
                className={`cursor-pointer ${selectedPuppy?.id === puppy.id ? 'bg-muted' : ''}`}
                onClick={() => onRowSelect(puppy)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {puppy.imageUrl ? (
                        <AvatarImage src={puppy.imageUrl} alt={puppy.name} />
                      ) : (
                        <AvatarFallback>
                          {puppy.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleNameClick(puppy);
                      }}
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      {puppy.name}
                    </button>
                  </div>
                </TableCell>
                <TableCell>{puppy.gender}</TableCell>
                <TableCell>{puppy.color}</TableCell>
                <TableCell>{puppy.birthWeight} kg</TableCell>
                <TableCell>{getCurrentWeight(puppy)} kg</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      handleEditClick(puppy);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground mb-4">No puppies added to this litter yet</p>
          <Button 
            variant="outline" 
            onClick={() => setShowAddPuppyDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add First Puppy
          </Button>
        </div>
      )}

      {/* Puppy Measurements Dialog */}
      {activePuppy && (
        <Dialog open={showMeasurementsDialog} onOpenChange={setShowMeasurementsDialog}>
          <PuppyMeasurementsDialog 
            puppy={activePuppy} 
            onClose={() => setShowMeasurementsDialog(false)}
            onUpdate={onUpdatePuppy}
          />
        </Dialog>
      )}
    </div>
  );
};

export default PuppyList;
