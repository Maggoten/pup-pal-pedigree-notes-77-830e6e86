
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PawPrint, Baby } from 'lucide-react';
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
    <Card className="mb-6 sage-gradient border border-greige-300 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 opacity-10">
        <PawPrint className="w-32 h-32 text-primary transform rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 opacity-10">
        <PawPrint className="w-20 h-20 text-primary transform -rotate-12" />
      </div>
      
      <CardContent className="pt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-greige-50 border border-greige-200 rounded-lg p-4 flex flex-col items-center transform transition-transform hover:scale-105 hover:shadow-md">
            <div className="bg-brown-100/50 p-3 rounded-full mb-3">
              <Calendar className="h-7 w-7 text-brown-600" />
            </div>
            <h3 className="font-medium text-lg">Mating Date</h3>
            <p className="mt-1">{format(matingDate, 'PPP')}</p>
          </div>
          
          <div className="bg-blush-50 border border-blush-200 rounded-lg p-4 flex flex-col items-center transform transition-transform hover:scale-105 hover:shadow-md">
            <div className="bg-blush-100/50 p-3 rounded-full mb-3">
              <Calendar className="h-7 w-7 text-blush-600" />
            </div>
            <h3 className="font-medium text-lg">Due Date</h3>
            <p className="mt-1">{format(expectedDueDate, 'PPP')}</p>
          </div>
          
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4 flex flex-col items-center transform transition-transform hover:scale-105 hover:shadow-md">
            <div className="bg-sage-100/50 p-3 rounded-full mb-3">
              <Baby className="h-7 w-7 text-sage-600" />
            </div>
            <h3 className="font-medium text-lg">Days Remaining</h3>
            <p className="mt-1">{daysLeft} days</p>
            <div className="w-full bg-sage-100 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-sage-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (63-daysLeft)/63*100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancySummaryCards;
