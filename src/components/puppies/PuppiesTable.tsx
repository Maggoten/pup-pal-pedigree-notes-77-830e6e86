
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';

interface PuppiesTableProps {
  puppies: Puppy[];
}

const PuppiesTable: React.FC<PuppiesTableProps> = ({ puppies }) => {
  return (
    <Table className="border border-border rounded-md overflow-hidden">
      <TableHeader className="bg-secondary/40">
        <TableRow>
          <TableHead className="text-foreground font-medium">Name</TableHead>
          <TableHead className="text-foreground font-medium">Gender</TableHead>
          <TableHead className="text-foreground font-medium">Color</TableHead>
          <TableHead className="text-foreground font-medium">Current Weight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {puppies.map(puppy => {
          const latestWeight = puppy.weightLog.length > 0 
            ? puppy.weightLog[puppy.weightLog.length - 1].weight 
            : 0;
            
          return (
            <TableRow key={puppy.id} className="hover:bg-secondary/20">
              <TableCell className="font-medium">{puppy.name}</TableCell>
              <TableCell className={puppy.gender === 'male' ? 'text-blue-500' : 'text-pink-400'}>
                {puppy.gender}
              </TableCell>
              <TableCell>{puppy.color}</TableCell>
              <TableCell>{latestWeight} kg</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PuppiesTable;
