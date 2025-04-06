
import React from 'react';
import { Calendar, PawPrint, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StatsCards from './StatsCards';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { format } from 'date-fns';

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
      color: "bg-sage-50 border-sage-200"
    },
    {
      title: "Planned Litters",
      count: plannedLitters.count,
      icon: <PawPrint className="h-5 w-5 text-brown-600" />,
      highlight: plannedLitters.nextDate ? `Next: ${format(plannedLitters.nextDate, 'MMM d')}` : null,
      path: "/planned-litters",
      color: "bg-greige-50 border-greige-200"
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: <PawPrint className="h-5 w-5 text-blush-600" />,
      highlight: activePregnancies.length > 0 ? `${activePregnancies[0].daysLeft} days to due date` : null,
      path: "/pregnancy",
      color: "bg-blush-50 border-blush-200"
    },
    {
      title: "Recent Litters",
      count: recentLitters.count,
      icon: <Heart className="h-5 w-5 text-sage-600" />,
      highlight: recentLitters.latest ? `Latest: ${format(recentLitters.latest, 'MMM d')}` : null,
      path: "/my-litters",
      color: "bg-sage-100 border-sage-300"
    }
  ];
  
  return (
    <div className="rounded-lg overflow-hidden border border-greige-300 sage-gradient">
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metricCards.map((card, index) => (
            <div 
              key={index} 
              className={`${card.color} border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
              onClick={() => navigate(card.path)}
            >
              <div className="flex items-center gap-2 mb-1">
                {card.icon}
                <span className="font-medium text-sm">{card.title}</span>
              </div>
              <div className="text-2xl font-bold">{card.count}</div>
              {card.highlight && (
                <div className="text-xs text-muted-foreground mt-1">{card.highlight}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
