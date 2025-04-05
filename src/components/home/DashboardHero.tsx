
import React from 'react';
import { Dog, Calendar, PawPrint, Heart } from 'lucide-react';
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
  
  const handleAddDogClick = () => {
    navigate('/my-dogs');
  };

  const metricCards = [
    {
      title: "Reminders",
      count: reminders.count,
      icon: <Calendar className="h-5 w-5 text-amber-600" />,
      highlight: reminders.highPriority > 0 ? `${reminders.highPriority} high priority` : null,
      path: "#reminders",
      color: "bg-amber-50 border-amber-200"
    },
    {
      title: "Planned Litters",
      count: plannedLitters.count,
      icon: <Dog className="h-5 w-5 text-indigo-600" />,
      highlight: plannedLitters.nextDate ? `Next: ${format(plannedLitters.nextDate, 'MMM d')}` : null,
      path: "/planned-litters",
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: <PawPrint className="h-5 w-5 text-rose-600" />,
      highlight: activePregnancies.length > 0 ? `${activePregnancies[0].daysLeft} days to due date` : null,
      path: "/pregnancy",
      color: "bg-rose-50 border-rose-200"
    },
    {
      title: "Recent Litters",
      count: recentLitters.count,
      icon: <Heart className="h-5 w-5 text-green-600" />,
      highlight: recentLitters.latest ? `Latest: ${format(recentLitters.latest, 'MMM d')}` : null,
      path: "/my-litters",
      color: "bg-green-50 border-green-200"
    }
  ];
  
  return (
    <div className="rounded-lg overflow-hidden border border-primary/20 bg-gradient-to-br from-[#F5F0E5] to-[#EAE0C9]">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
              <Dog className="h-6 w-6 text-primary" />
              Good day, {username}!
            </h2>
            <p className="text-muted-foreground max-w-md">
              Here's your breeding program at a glance:
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleAddDogClick}
              variant="default" 
              className="shadow-sm"
            >
              <Dog className="mr-2 h-4 w-4" />
              Add New Dog
            </Button>
            
            <Button
              variant="outline"
              className="bg-white/50 shadow-sm border-primary/20"
              onClick={() => navigate('/planned-litters')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Plan Litter
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
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
