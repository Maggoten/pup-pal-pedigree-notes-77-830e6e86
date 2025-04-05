
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface ActivePregnanciesCardProps {
  pregnancies: ActivePregnancy[];
}

const ActivePregnanciesCard: React.FC<ActivePregnanciesCardProps> = ({ 
  pregnancies 
}) => {
  const navigate = useNavigate();

  const handlePregnancyClick = (pregnancyId: string) => {
    navigate(`/pregnancy/${pregnancyId}`);
  };

  const handleAddPregnancy = () => {
    navigate('/planned-litters');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="h-5 w-5" />
          Active Pregnancies
        </CardTitle>
        <CardDescription>Track your pregnant females</CardDescription>
      </CardHeader>
      <CardContent>
        {pregnancies.length > 0 ? (
          <div className="space-y-4">
            {pregnancies.map((pregnancy) => (
              <div 
                key={pregnancy.id} 
                className="rounded-lg border p-4 bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handlePregnancyClick(pregnancy.id)}
              >
                <h3 className="font-medium text-lg">
                  {pregnancy.femaleName} × {pregnancy.maleName}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Mating Date:</span> 
                    {format(pregnancy.matingDate, 'PPP')}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Due Date:</span> 
                    {format(pregnancy.expectedDueDate, 'PPP')}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Days Left:</span> 
                    {pregnancy.daysLeft}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Pregnancies</h3>
            <p className="text-muted-foreground mb-4">Add a pregnancy to start tracking</p>
            <Button onClick={handleAddPregnancy}>Add Pregnancy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivePregnanciesCard;
