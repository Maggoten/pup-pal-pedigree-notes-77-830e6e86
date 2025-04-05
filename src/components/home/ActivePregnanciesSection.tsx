
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
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5 border-b border-primary/20 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PawPrint className="h-5 w-5 text-primary" />
          Active Pregnancies
        </CardTitle>
        <CardDescription>Track your pregnant females</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {pregnancies.map((pregnancy) => (
            <div 
              key={pregnancy.id} 
              className="rounded-lg border p-3 bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate(`/pregnancy/${pregnancy.id}`)}
            >
              <h3 className="font-medium text-base">
                {pregnancy.femaleName} × {pregnancy.maleName}
              </h3>
              <div className="mt-1 space-y-1 text-xs">
                <p className="flex items-center gap-1">
                  <span className="font-medium">Due:</span> 
                  {format(pregnancy.expectedDueDate, 'PPP')}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="flex items-center gap-1">
                    <span className="font-medium">Days Left:</span> 
                    <span className="font-bold text-primary">{pregnancy.daysLeft}</span>
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7 text-xs"
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
  );
};

export default ActivePregnanciesSection;
