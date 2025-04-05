
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Puppy } from '@/types/breeding';

interface PuppyWeightLogProps {
  puppies: Puppy[];
}

const PuppyWeightLog: React.FC<PuppyWeightLogProps> = ({ puppies }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Log</CardTitle>
        <CardDescription>Weight tracking for all puppies</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {puppies.map(puppy => (
                <TableHead key={puppy.id}>{puppy.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {puppies[0]?.weightLog.map((_, index) => {
              const date = puppies[0].weightLog[index].date;
              return (
                <TableRow key={date}>
                  <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
                  {puppies.map(puppy => (
                    <TableCell key={puppy.id}>
                      {puppy.weightLog[index]?.weight || '-'} kg
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PuppyWeightLog;
