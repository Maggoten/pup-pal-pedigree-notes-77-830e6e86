
import React, { memo, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';

interface PuppiesTableProps {
  puppies: Puppy[];
}

const PuppiesTable: React.FC<PuppiesTableProps> = ({ puppies }) => {
  // Use memoization to prevent unnecessary recalculations
  const puppiesWithDisplayWeight = useMemo(() => {
    return puppies.map(puppy => {
      console.log(`PuppiesTable: Calculating display weight for puppy ${puppy.name} (${puppy.id})`, {
        weightLogLength: puppy.weightLog?.length || 0,
        puppyId: puppy.id
      });
      
      // Always prioritize weight log entries over currentWeight
      let displayWeight = 'Not recorded';
      
      if (puppy.weightLog && puppy.weightLog.length > 0) {
        // Get the last recorded weight from the weight log
        // Sort by date to ensure we get the most recent
        const sortedWeightLog = [...puppy.weightLog]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (sortedWeightLog.length > 0) {
          const lastWeight = sortedWeightLog[0];
          displayWeight = `${lastWeight.weight} kg`;
          
          console.log(`PuppiesTable: Using last weight log entry for ${puppy.name}: ${lastWeight.weight} kg from ${lastWeight.date}`);
        }
      } 
      // Only use currentWeight as fallback if no weight log entries exist
      else if (puppy.currentWeight) {
        displayWeight = `${puppy.currentWeight} kg`;
        console.log(`PuppiesTable: Using fallback currentWeight for ${puppy.name}: ${puppy.currentWeight} kg`);
      }
      
      return {
        ...puppy,
        displayWeight
      };
    });
  }, [puppies]);
  
  return (
    <Table className="border border-border rounded-md overflow-hidden">
      <TableHeader className="bg-greige-100/40">
        <TableRow>
          <TableHead className="text-foreground font-medium">Name</TableHead>
          <TableHead className="text-foreground font-medium">Gender</TableHead>
          <TableHead className="text-foreground font-medium">Color</TableHead>
          <TableHead className="text-foreground font-medium">Current Weight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {puppiesWithDisplayWeight.map(puppy => (
          <TableRow key={puppy.id} className="hover:bg-greige-100/20">
            <TableCell className="font-medium">{puppy.name}</TableCell>
            <TableCell className={puppy.gender === 'male' ? 'text-sage-600' : 'text-blush-400'}>
              {puppy.gender}
            </TableCell>
            <TableCell>{puppy.color}</TableCell>
            <TableCell>{puppy.displayWeight}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(PuppiesTable);
