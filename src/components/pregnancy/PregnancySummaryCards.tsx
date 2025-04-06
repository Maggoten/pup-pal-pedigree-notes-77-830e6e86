
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
    <Card className="mb-6 sage-gradient border border-greige-300">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-greige-50 border border-greige-200 rounded-lg p-4 flex flex-col items-center">
            <Calendar className="h-8 w-8 text-brown-600 mb-2" />
            <h3 className="font-medium text-lg">Mating Date</h3>
            <p>{format(matingDate, 'PPP')}</p>
          </div>
          <div className="bg-blush-50 border border-blush-200 rounded-lg p-4 flex flex-col items-center">
            <Calendar className="h-8 w-8 text-blush-600 mb-2" />
            <h3 className="font-medium text-lg">Due Date</h3>
            <p>{format(expectedDueDate, 'PPP')}</p>
          </div>
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 flex flex-col items-center">
            <PawPrint className="h-8 w-8 text-sage-600 mb-2" />
            <h3 className="font-medium text-lg">Days Remaining</h3>
            <p>{daysLeft} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancySummaryCards;
