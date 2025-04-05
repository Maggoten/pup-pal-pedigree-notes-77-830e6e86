
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, ChartBar, Pencil } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Puppy } from '@/types/breeding';
import AddPuppyDialog from './AddPuppyDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  damBreed?: string;
  onMeasurementsClick: (puppy: Puppy) => void;
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
  damBreed,
  onMeasurementsClick
}) => {
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
      <div className="flex justify-end">
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
            damBreed={damBreed}
          />
        </Dialog>
      </div>
      
      {puppies.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Birth Weight</TableHead>
                <TableHead>Current Weight</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {puppies.map(puppy => (
                <TableRow 
                  key={puppy.id} 
                  className={`cursor-pointer transition-colors ${selectedPuppy?.id === puppy.id ? 'bg-muted' : ''}`}
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
                      <div className="flex flex-col">
                        <span className="text-primary hover:underline font-medium">{puppy.name}</span>
                        {puppy.breed && <span className="text-xs text-muted-foreground">{puppy.breed}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={puppy.gender === 'male' ? 'default' : 'secondary'} className="font-normal">
                      {puppy.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{puppy.color}</TableCell>
                  <TableCell>{puppy.birthWeight} kg</TableCell>
                  <TableCell>{getCurrentWeight(puppy)} kg</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        onMeasurementsClick(puppy);
                      }}
                      className="flex items-center gap-1 mr-2"
                    >
                      <ChartBar className="h-3.5 w-3.5" />
                      Measurements
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
