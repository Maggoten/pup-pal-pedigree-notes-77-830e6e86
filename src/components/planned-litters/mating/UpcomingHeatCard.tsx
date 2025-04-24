
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Info } from 'lucide-react';
import { UpcomingHeat } from '@/types/reminders';

interface UpcomingHeatCardProps {
  upcomingHeats: UpcomingHeat[];
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ upcomingHeats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Heat Cycles</CardTitle>
        <CardDescription>Track your bitches' heat cycles</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingHeats.length > 0 ? (
          <div className="space-y-3">
            {upcomingHeats.map((heat, index) => (
              <div
                key={`${heat.dogId}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg border bg-rose-50 border-rose-200"
              >
                <div className="mt-0.5">
                  <Calendar className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h4 className="font-medium">{heat.dogName}'s Heat Cycle</h4>
                  <p className="text-sm text-muted-foreground">
                    Expected on {format(heat.date, 'PPP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Upcoming Heat Cycles</h3>
            <p className="text-muted-foreground mb-4">Add heat information to your female dogs to track cycles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingHeatCard;
