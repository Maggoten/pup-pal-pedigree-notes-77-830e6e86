
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const MatingTips = [
  "Wait until the bitch is in standing heat before mating",
  "The optimal time for mating is usually 10-14 days after the start of heat",
  "Consider progesterone testing to determine the optimal mating time",
  "Two matings 24-48 hours apart can increase the chances of pregnancy",
  "Keep both dogs calm and relaxed before and after mating"
];

const Mating: React.FC = () => {
  const handleAddMatingClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding mating records will be available in the next update."
    });
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
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Heat Cycles</h3>
              <p className="text-muted-foreground mb-4">Add your first heat cycle tracking</p>
              <Button onClick={handleAddMatingClick}>Add Heat Cycle</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Matings</CardTitle>
            <CardDescription>Recent breeding attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Recent Matings</h3>
              <p className="text-muted-foreground mb-4">Record your breeding attempts</p>
              <Button onClick={handleAddMatingClick}>Log Mating</Button>
            </div>
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
