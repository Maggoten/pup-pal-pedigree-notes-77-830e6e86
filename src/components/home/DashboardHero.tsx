
import React from 'react';
import { Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StatsCards from './StatsCards';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { format } from 'date-fns';
import DogIllustration from '../illustrations/DogIllustration';

interface DashboardHeroProps {
  username: string;
  reminders: { count: number; highPriority: number };
  plannedLitters: { count: number; nextDate: Date | null };
  activePregnancies: ActivePregnancy[];
  recentLitters: { count: number; latest: Date | null };
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ 
  username, 
  reminders,
  plannedLitters,
  activePregnancies,
  recentLitters
}) => {
  const navigate = useNavigate();
  
  const metricCards = [
    {
      title: "Reminders",
      count: reminders.count,
      icon: <Calendar className="h-5 w-5 text-sage-600" />,
      highlight: reminders.highPriority > 0 ? `${reminders.highPriority} high priority` : null,
      path: "#reminders",
      color: "bg-sage-50 border-sage-200 hover:border-sage-300",
      breed: "generic" as const
    },
    {
      title: "Planned Litters",
      count: plannedLitters.count,
      icon: <DogIllustration breed="shetland-sheepdog" size={20} color="#7A6E52" secondaryColor="#F0EDE5" />,
      highlight: plannedLitters.nextDate ? `Next: ${format(plannedLitters.nextDate, 'MMM d')}` : null,
      path: "/planned-litters",
      color: "bg-greige-50 border-greige-200 hover:border-greige-300",
      breed: "shetland-sheepdog" as const
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: <DogIllustration breed="border-collie" size={20} color="#B3003A" secondaryColor="#FFDEE8" />,
      highlight: activePregnancies.length > 0 ? `${activePregnancies[0].daysLeft} days to due date` : null,
      path: "/pregnancy",
      color: "bg-blush-50 border-blush-200 hover:border-blush-300",
      breed: "border-collie" as const
    },
    {
      title: "Recent Litters",
      count: recentLitters.count,
      icon: <Heart className="h-5 w-5 text-sage-600" />,
      highlight: recentLitters.latest ? `Latest: ${format(recentLitters.latest, 'MMM d')}` : null,
      path: "/my-litters",
      color: "bg-sage-100 border-sage-300 hover:border-sage-400",
      breed: "generic" as const
    }
  ];
  
  return (
    <div className="rounded-lg overflow-hidden border border-greige-300 sage-gradient relative">
      {/* Background illustration */}
      <div className="absolute top-0 right-0 opacity-10">
        <DogIllustration 
          breed="border-collie"
          size={160}
          color="#7A6E52"
          secondaryColor="#F0EDE5"
        />
      </div>
      <div className="absolute bottom-0 left-0 opacity-10">
        <DogIllustration 
          breed="shetland-sheepdog"
          size={120}
          color="#4D684D"
          secondaryColor="#E7EDE3"
        />
      </div>
      
      <div className="p-6 md:p-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metricCards.map((card, index) => (
            <div 
              key={index} 
              className={`${card.color} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}
              onClick={() => navigate(card.path)}
            >
              <div className="flex items-center gap-2 mb-1.5 relative z-10">
                <div className="p-1.5 bg-white/50 rounded-full">
                  {card.icon}
                </div>
                <span className="font-medium text-sm">{card.title}</span>
              </div>
              <div className="text-2xl font-bold relative z-10">{card.count}</div>
              {card.highlight && (
                <div className="text-xs text-muted-foreground mt-1 relative z-10">{card.highlight}</div>
              )}
              
              {/* Card background illustration */}
              <div className="absolute bottom-0 right-0 opacity-10">
                <DogIllustration 
                  breed={card.breed}
                  size={48}
                  color="currentColor"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
