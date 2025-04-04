
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Puppy {
  id: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  weightLog: { date: string; weight: number }[];
}

interface Litter {
  id: string;
  name: string;
  dateOfBirth: string;
  sireId: string;
  damId: string;
  sireName: string;
  damName: string;
  puppies: Puppy[];
}

// Sample data
const litters: Litter[] = [
  {
    id: '1',
    name: 'Spring Litter 2025',
    dateOfBirth: '2025-04-15',
    sireId: '1',
    damId: '2',
    sireName: 'Max',
    damName: 'Bella',
    puppies: [
      {
        id: '1',
        name: 'Puppy 1',
        gender: 'male',
        color: 'Golden',
        weightLog: [
          { date: '2025-04-15', weight: 0.45 },
          { date: '2025-04-16', weight: 0.48 },
          { date: '2025-04-17', weight: 0.52 },
        ]
      },
      {
        id: '2',
        name: 'Puppy 2',
        gender: 'female',
        color: 'Light Golden',
        weightLog: [
          { date: '2025-04-15', weight: 0.42 },
          { date: '2025-04-16', weight: 0.46 },
          { date: '2025-04-17', weight: 0.49 },
        ]
      }
    ]
  }
];

const Puppies: React.FC = () => {
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(litters.length > 0 ? litters[0].id : null);
  
  const selectedLitter = litters.find(litter => litter.id === selectedLitterId);
  
  const handleAddLitterClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding new litters will be available in the next update."
    });
  };
  
  const handleAddWeightLog = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Logging puppy weights will be available in the next update."
    });
  };

  return (
    <PageLayout 
      title="Puppies" 
      description="Track your litters and individual puppies"
    >
      <div className="flex justify-end">
        <Button onClick={handleAddLitterClick} className="flex items-center gap-2 mb-6">
          <PlusCircle className="h-4 w-4" />
          Add New Litter
        </Button>
      </div>
      
      {litters.length > 0 ? (
        <>
          <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
            <TabsList className="w-full justify-start overflow-auto">
              {litters.map(litter => (
                <TabsTrigger key={litter.id} value={litter.id}>{litter.name}</TabsTrigger>
              ))}
            </TabsList>
            
            {litters.map(litter => (
              <TabsContent key={litter.id} value={litter.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Litter Details</CardTitle>
                    <CardDescription>
                      Born: {new Date(litter.dateOfBirth).toLocaleDateString()} | 
                      Sire: {litter.sireName} | 
                      Dam: {litter.damName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Puppies ({litter.puppies.length})</h3>
                        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleAddWeightLog}>
                          <BarChart className="h-4 w-4" />
                          Log Weights
                        </Button>
                      </div>
                      
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
                          {litter.puppies.map(puppy => {
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
                    </div>
                  </CardContent>
                </Card>
                
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
                          {litter.puppies.map(puppy => (
                            <TableHead key={puppy.id}>{puppy.name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {litter.puppies[0]?.weightLog.map((_, index) => {
                          const date = litter.puppies[0].weightLog[index].date;
                          return (
                            <TableRow key={date}>
                              <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
                              {litter.puppies.map(puppy => (
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
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No Litters Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first litter to start tracking puppies</p>
            <Button onClick={handleAddLitterClick}>Add Your First Litter</Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default Puppies;
