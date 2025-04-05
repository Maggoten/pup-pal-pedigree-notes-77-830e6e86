
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import PuppiesTable from './PuppiesTable';

interface PuppiesCardProps {
  puppies: Puppy[];
  onLogWeights: () => void;
}

const PuppiesCard: React.FC<PuppiesCardProps> = ({ puppies, onLogWeights }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Litter Details</CardTitle>
        <CardDescription>
          Born: {new Date(puppies[0]?.weightLog[0]?.date || new Date()).toLocaleDateString()} | 
          Sire: {/* Add sire name prop if needed */} | 
          Dam: {/* Add dam name prop if needed */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Puppies ({puppies.length})</h3>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={onLogWeights}>
              <BarChart className="h-4 w-4" />
              Log Weights
            </Button>
          </div>
          
          <PuppiesTable puppies={puppies} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppiesCard;
