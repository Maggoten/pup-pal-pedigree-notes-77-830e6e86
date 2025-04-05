
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface ActivePregnanciesSectionProps {
  pregnancies: ActivePregnancy[];
}

const ActivePregnanciesSection: React.FC<ActivePregnanciesSectionProps> = ({ pregnancies }) => {
  const navigate = useNavigate();

  if (pregnancies.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            Active Pregnancies
          </CardTitle>
          <CardDescription>Track your pregnant females</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pregnancies.map((pregnancy) => (
              <div 
                key={pregnancy.id} 
                className="rounded-lg border p-4 bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/pregnancy/${pregnancy.id}`)}
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
                  <div className="flex items-center justify-between mt-2">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Days Left:</span> 
                      <span className="font-bold text-primary">{pregnancy.daysLeft}</span>
                    </p>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pregnancy/${pregnancy.id}`);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivePregnanciesSection;
