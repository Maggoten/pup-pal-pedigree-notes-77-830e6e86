
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Puppy } from '@/types/breeding';
import AddPuppyDialog from './AddPuppyDialog';

interface PuppyListProps {
  puppies: Puppy[];
  onAddPuppy: (puppy: Puppy) => void;
  onSelectPuppy: (puppy: Puppy) => void;
  showAddPuppyDialog: boolean;
  setShowAddPuppyDialog: (show: boolean) => void;
  puppyNumber: number;
  litterDob: string;
}

const PuppyList: React.FC<PuppyListProps> = ({
  puppies,
  onAddPuppy,
  onSelectPuppy,
  showAddPuppyDialog,
  setShowAddPuppyDialog,
  puppyNumber,
  litterDob
}) => {
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
            puppyNumber={puppyNumber}
            litterDob={litterDob}
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
              <TableHead>Breed</TableHead>
              <TableHead>Birth Weight</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {puppies.map(puppy => (
              <TableRow key={puppy.id}>
                <TableCell>{puppy.name}</TableCell>
                <TableCell>{puppy.gender}</TableCell>
                <TableCell>{puppy.color}</TableCell>
                <TableCell>{puppy.breed || '-'}</TableCell>
                <TableCell>{puppy.birthWeight} kg</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectPuppy(puppy)}
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
    </div>
  );
};

export default PuppyList;
