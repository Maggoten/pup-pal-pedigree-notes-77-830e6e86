
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, PlusCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export interface ActivePregnancy {
  id: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
  daysLeft: number;
}

interface ActivePregnanciesListProps {
  pregnancies: ActivePregnancy[];
  onAddPregnancy: () => void;
  isLoading?: boolean;
}

const ActivePregnanciesList: React.FC<ActivePregnanciesListProps> = ({ 
  pregnancies, 
  onAddPregnancy,
  isLoading = false
}) => {
  const navigate = useNavigate();

  const handleViewPregnancyDetails = (pregnancyId: string) => {
    navigate(`/pregnancy/${pregnancyId}`);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Active Pregnancies
          </span>
          <Button variant="ghost" size="icon" onClick={onAddPregnancy}>
            <PlusCircle className="h-5 w-5" />
          </Button>
        </CardTitle>
        <CardDescription>Manage your current pregnancies</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pregnancies.length > 0 ? (
          <div className="space-y-4">
            {pregnancies.map((pregnancy) => (
              <div 
                key={pregnancy.id} 
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleViewPregnancyDetails(pregnancy.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">
                    {pregnancy.femaleName} × {pregnancy.maleName}
                  </h3>
                  <span className="bg-primary/20 text-primary text-sm font-medium rounded-full px-2 py-0.5">
                    {pregnancy.daysLeft} days left
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mating Date:</p>
                    <p>{format(pregnancy.matingDate, 'PP')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date:</p>
                    <p>{format(pregnancy.expectedDueDate, 'PP')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-3">No active pregnancies found</p>
            <Button onClick={onAddPregnancy}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Pregnancy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivePregnanciesList;
