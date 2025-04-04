
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PlannedLitter {
  id: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  expectedHeatDate: string;
  notes: string;
}

// Sample data
const plannedLitters: PlannedLitter[] = [
  {
    id: '1',
    maleId: '3',
    femaleId: '2',
    maleName: 'Rocky',
    femaleName: 'Bella',
    expectedHeatDate: '2025-05-15',
    notes: 'First planned breeding, watching for genetic diversity'
  }
];

const PlannedLitters: React.FC = () => {
  const handleAddClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding planned litters will be available in the next update."
    });
  };

  return (
    <PageLayout 
      title="Planned Litters" 
      description="Plan your future litters and track breeding combinations"
    >
      <div className="flex justify-end">
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Planned Litter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plannedLitters.map(litter => (
          <Card key={litter.id}>
            <CardHeader>
              <CardTitle>{litter.maleName} × {litter.femaleName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expected heat: {new Date(litter.expectedHeatDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{litter.notes}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {plannedLitters.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No Planned Litters</h3>
          <p className="text-muted-foreground">Create your first planned breeding combination</p>
          <Button onClick={handleAddClick} className="mt-4">
            Add Your First Planned Litter
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default PlannedLitters;
