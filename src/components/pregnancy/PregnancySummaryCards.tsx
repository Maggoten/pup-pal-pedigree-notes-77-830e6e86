
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PawPrint } from 'lucide-react';
import { format } from 'date-fns';

interface PregnancySummaryCardsProps {
  matingDate: Date;
  expectedDueDate: Date;
  daysLeft: number;
}

const PregnancySummaryCards: React.FC<PregnancySummaryCardsProps> = ({
  matingDate,
  expectedDueDate,
  daysLeft,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center">
            <Calendar className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-lg">Mating Date</h3>
            <p>{format(matingDate, 'PPP')}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-lg">Due Date</h3>
            <p>{format(expectedDueDate, 'PPP')}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
            <PawPrint className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-lg">Days Remaining</h3>
            <p>{daysLeft} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancySummaryCards;
