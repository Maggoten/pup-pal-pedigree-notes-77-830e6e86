
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Thermometer, Baby } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const weeklyDevelopment = [
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

const Pregnancy: React.FC = () => {
  const handleAddPregnancyClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding pregnancy records will be available in the next update."
    });
  };

  const handleLogTemperature = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Temperature logging will be available in the next update."
    });
  };

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
    >
      <div className="flex justify-end">
        <Button onClick={handleAddPregnancyClick} className="mb-6">Add Pregnancy</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Pregnancies</CardTitle>
            <CardDescription>Track ongoing pregnancies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Pregnancies</h3>
              <p className="text-muted-foreground mb-4">Add a pregnancy to start tracking</p>
              <Button onClick={handleAddPregnancyClick}>Add Pregnancy</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Log</CardTitle>
            <CardDescription>Monitor bitch temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Thermometer className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Temperature Data</h3>
              <p className="text-muted-foreground mb-4">Record temperature readings</p>
              <Button onClick={handleLogTemperature}>Log Temperature</Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <Baby className="h-6 w-6 text-primary" />
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
    </PageLayout>
  );
};

export default Pregnancy;
