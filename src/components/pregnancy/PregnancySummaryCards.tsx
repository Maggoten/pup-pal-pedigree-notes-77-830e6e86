
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PawPrint, Baby, Heart } from 'lucide-react';
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
    <Card className="mb-6 bg-gradient-to-br from-warmbeige-50 to-warmbeige-100 border border-warmbeige-200 shadow-md overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <PawPrint className="w-32 h-32 text-warmbeige-700 transform rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none">
        <PawPrint className="w-20 h-20 text-warmbeige-700 transform -rotate-12" />
      </div>
      
      <CardContent className="pt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-warmbeige-200 rounded-lg p-4 flex flex-col items-center transform transition-transform hover:scale-105 hover:shadow-md">
            <div className="bg-warmbeige-100 p-3 rounded-full mb-3">
              <Heart className="h-7 w-7 text-warmgreen-700" />
            </div>
            <h3 className="font-medium text-lg">Mating Date</h3>
            <p className="mt-1 text-warmbeige-800">{format(matingDate, 'PPP')}</p>
          </div>
          
          <div className="bg-white border border-warmbeige-200 rounded-lg p-4 flex flex-col items-center transform transition-transform hover:scale-105 hover:shadow-md">
            <div className="bg-warmbeige-100 p-3 rounded-full mb-3">
              <Calendar className="h-7 w-7 text-warmgreen-700" />
            </div>
            <h3 className="font-medium text-lg">Due Date</h3>
            <p className="mt-1 text-warmbeige-800">{format(expectedDueDate, 'PPP')}</p>
          </div>
          
          <div className="bg-white border border-warmbeige-200 rounded-lg p-4 flex flex-col items-center transform transition-transform hover:scale-105 hover:shadow-md">
            <div className="bg-warmbeige-100 p-3 rounded-full mb-3">
              <PawPrint className="h-7 w-7 text-warmgreen-700" />
            </div>
            <h3 className="font-medium text-lg">Days Remaining</h3>
            <p className="mt-1 text-warmbeige-800">{daysLeft} days</p>
            <div className="w-full bg-warmbeige-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-warmgreen-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (63-daysLeft)/63*100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-warmbeige-600 mt-1 w-full text-center">
              {Math.floor((63-daysLeft)/63*100)}% complete
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancySummaryCards;
