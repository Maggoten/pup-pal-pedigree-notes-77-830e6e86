
import React, { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Info, PawPrint, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDogs } from '@/context/DogsContext';
import { calculateUpcomingHeats, UpcomingHeat } from '@/utils/heatCalculator';
import { format, parseISO, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { plannedLitterService } from '@/services/PlannedLitterService';
import { PlannedLitter } from '@/types/breeding';

const MatingTips = [
  "Wait until the bitch is in standing heat before mating",
  "The optimal time for mating is usually 10-14 days after the start of heat",
  "Consider progesterone testing to determine the optimal mating time",
  "Two matings 24-48 hours apart can increase the chances of pregnancy",
  "Keep both dogs calm and relaxed before and after mating"
];

interface RecentMating {
  id: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

const Mating: React.FC = () => {
  const { dogs } = useDogs();
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [recentMatings, setRecentMatings] = useState<RecentMating[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    setUpcomingHeats(calculateUpcomingHeats(dogs));
    
    // Load planned litters and extract mating dates
    const plannedLitters = plannedLitterService.loadPlannedLitters();
    const matings: RecentMating[] = [];
    
    plannedLitters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(dateStr => {
          const matingDate = parseISO(dateStr);
          // Only include matings that have already occurred
          if (isBefore(matingDate, new Date())) {
            matings.push({
              id: `${litter.id}-${dateStr}`,
              maleName: litter.maleName,
              femaleName: litter.femaleName,
              date: matingDate
            });
          }
        });
      }
    });
    
    // Sort by date, most recent first
    matings.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentMatings(matings);
  }, [dogs]);
  
  const handleAddMatingClick = () => {
    navigate('/planned-litters');
  };

  return (
    <PageLayout 
      title="Mating" 
      description="Track heat cycles and mating attempts"
    >
      <div className="grid gap-6 md:grid-cols-2">
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
                      <PawPrint className="h-5 w-5 text-rose-500" />
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
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Heat Cycles</h3>
                <p className="text-muted-foreground mb-4">Add heat information to your female dogs to track cycles</p>
                <Button onClick={handleAddMatingClick}>Add Heat Cycle</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Matings</CardTitle>
            <CardDescription>Recent breeding attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMatings.length > 0 ? (
              <div className="space-y-3">
                {recentMatings.map((mating) => (
                  <div
                    key={mating.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-purple-50 border-purple-200"
                  >
                    <div className="mt-0.5">
                      <Heart className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{mating.maleName} × {mating.femaleName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Mated on {format(mating.date, 'PPP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recent Matings</h3>
                <p className="text-muted-foreground mb-4">Record your breeding attempts</p>
                <Button onClick={handleAddMatingClick}>Log Mating</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mating Tips & Tricks</CardTitle>
          <CardDescription>Important information for successful breeding</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {MatingTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Mating;
