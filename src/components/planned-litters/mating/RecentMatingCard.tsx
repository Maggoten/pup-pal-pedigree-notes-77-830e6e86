
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Info } from 'lucide-react';
import { RecentMating } from '@/types/reminders';

interface RecentMatingCardProps {
  recentMatings: RecentMating[];
}

const RecentMatingCard: React.FC<RecentMatingCardProps> = ({ recentMatings }) => {
  return (
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
                key={`${mating.litterId}-${mating.date.toString()}`}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMatingCard;
