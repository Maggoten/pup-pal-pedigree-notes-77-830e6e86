
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

interface DevelopmentWeek {
  week: number;
  description: string;
}

const weeklyDevelopment: DevelopmentWeek[] = [
  {
    week: 1,
    description: "Fertilization and implantation of embryos. No visible signs of pregnancy yet."
  },
  {
    week: 2,
    description: "Embryos continue to develop. No visible signs of pregnancy."
  },
  {
    week: 3,
    description: "First signs may appear: slightly enlarged nipples, slight behavior changes."
  },
  {
    week: 4,
    description: "Fetal heartbeats may be detected by ultrasound. Morning sickness may occur."
  },
  {
    week: 5,
    description: "Abdomen begins to swell noticeably. Appetite may increase. Nipples enlarge further."
  },
  {
    week: 6,
    description: "Puppies developing rapidly. Abdomen continues to enlarge. Clear discharge may be present."
  },
  {
    week: 7,
    description: "Puppies continuing to grow. Milk may be expressed from nipples. Nesting behavior begins."
  },
  {
    week: 8,
    description: "Final week. Temperature should be monitored. Milk present. Restlessness and nesting intensify."
  },
  {
    week: 9,
    description: "Birth typically occurs around 63 days after conception. Temperature drops below 100°F (37.8°C) 24-48 hours before labor."
  }
];

const WeeklyDevelopmentGuide: React.FC = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Pregnancy Development Guide</CardTitle>
        <CardDescription>Weekly development of puppies during pregnancy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyDevelopment.map((week) => (
            <div key={week.week} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Week {week.week}</h4>
                <p className="text-sm text-muted-foreground">{week.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyDevelopmentGuide;
