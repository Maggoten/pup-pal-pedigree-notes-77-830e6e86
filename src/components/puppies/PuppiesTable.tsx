
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';

interface PuppiesTableProps {
  puppies: Puppy[];
}

const PuppiesTable: React.FC<PuppiesTableProps> = ({ puppies }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Current Weight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {puppies.map(puppy => {
          const latestWeight = puppy.weightLog.length > 0 
            ? puppy.weightLog[puppy.weightLog.length - 1].weight 
            : 0;
            
          return (
            <TableRow key={puppy.id}>
              <TableCell>{puppy.name}</TableCell>
              <TableCell>{puppy.gender}</TableCell>
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
