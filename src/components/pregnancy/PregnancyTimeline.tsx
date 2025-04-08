
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, differenceInDays, isBefore, isAfter } from 'date-fns';
import { PawPrint, Calendar, Baby } from 'lucide-react';

interface PregnancyTimelineProps {
  matingDate: Date;
  expectedDueDate: Date;
}

interface TimelineEvent {
  week: number;
  day: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  date: Date;
}

const PregnancyTimeline: React.FC<PregnancyTimelineProps> = ({ matingDate, expectedDueDate }) => {
  const today = new Date();
  
  // Calculate pregnancy timeline events
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Mating
    events.push({
      week: 0,
      day: 0,
      title: 'Mating Day',
      description: 'Breeding occurred. Fertilization may take place over the next 24-48 hours.',
      icon: <Calendar className="h-6 w-6 text-brown-600" />,
      date: matingDate
    });
    
    // Week 1
    events.push({
      week: 1,
      day: 7,
      title: 'Week 1: Fertilization',
      description: 'Fertilized eggs travel through the fallopian tubes to implant in the uterus.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 7)
    });
    
    // Week 2
    events.push({
      week: 2,
      day: 14,
      title: 'Week 2: Implantation',
      description: 'Embryos implant in the uterine lining. Development begins.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 14)
    });
    
    // Week 3
    events.push({
      week: 3,
      day: 21,
      title: 'Week 3: Early Development',
      description: 'Embryos continue developing. First signs may appear: slightly enlarged nipples, behavior changes.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 21)
    });
    
    // Week 4
    events.push({
      week: 4,
      day: 28,
      title: 'Week 4: Fetal Heartbeats',
      description: 'Fetal heartbeats may be detected by ultrasound. Morning sickness may occur.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 28)
    });
    
    // Week 5
    events.push({
      week: 5,
      day: 35,
      title: 'Week 5: Visible Growth',
      description: 'Abdomen begins to swell noticeably. Appetite may increase. Nipples enlarge further.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 35)
    });
    
    // Week 6
    events.push({
      week: 6,
      day: 42,
      title: 'Week 6: Rapid Development',
      description: 'Puppies developing rapidly. Abdomen continues to enlarge. Clear discharge may be present.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 42)
    });
    
    // Week 7
    events.push({
      week: 7,
      day: 49,
      title: 'Week 7: Preparation',
      description: 'Puppies continuing to grow. Milk may be expressed from nipples. Nesting behavior begins.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 49)
    });
    
    // Week 8
    events.push({
      week: 8,
      day: 56,
      title: 'Week 8: Pre-Labor',
      description: 'Final week. Temperature should be monitored. Milk present. Restlessness and nesting intensify.',
      icon: <PawPrint className="h-6 w-6 text-greige-600" />,
      date: addDays(matingDate, 56)
    });
    
    // Week 9 - Due Date
    events.push({
      week: 9,
      day: 63,
      title: 'Week 9: Birth',
      description: 'Expected whelping day. Temperature typically drops below 100°F (37.8°C) 24-48 hours before labor.',
      icon: <Baby className="h-6 w-6 text-brown-600" />,
      date: expectedDueDate
    });
    
    return events;
  };
  
  const timelineEvents = generateTimelineEvents();
  
  return (
    <Card className="bg-greige-50 border-greige-200">
      <CardHeader>
        <CardTitle className="text-brown-700">Pregnancy Timeline</CardTitle>
        <CardDescription>Key events during pregnancy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative ml-6 border-l-2 border-greige-300 pl-6 pb-6 space-y-8">
          {timelineEvents.map((event, index) => {
            const isPast = isBefore(event.date, today);
            const isCurrent = isBefore(today, addDays(event.date, 7)) && isAfter(today, event.date);
            
            return (
              <div key={index} className="relative">
                <div className={`absolute -left-9 p-1.5 rounded-full ${
                  isPast ? 'bg-sage-500' : isCurrent ? 'bg-brown-300' : 'bg-greige-300'
                }`}>
                  {event.icon}
                </div>
                <div className={`${isCurrent ? 'bg-cream-50 border-cream-200' : 'bg-white border-greige-200'} border rounded-lg p-4`}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg text-brown-700">
                      {event.title}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {format(event.date, 'PPP')}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {event.description}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Day {event.day}</span>
                    {isPast && <span className="ml-2 text-sage-600 font-medium">Completed</span>}
                    {isCurrent && <span className="ml-2 text-brown-600 font-medium">Current Stage</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancyTimeline;
