
import React, { useState } from 'react';
import { Calendar, PawPrint, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StatsCards from './StatsCards';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { format } from 'date-fns';
import RemindersDialog from '@/components/reminders/RemindersDialog';

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
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  
  const metricCards = [
    {
      title: "Reminders",
      count: reminders.count,
      icon: <Calendar className="h-5 w-5 text-sage-600" />,
      highlight: reminders.highPriority > 0 ? `${reminders.highPriority} high priority` : null,
      action: () => setRemindersDialogOpen(true),
      color: "bg-sage-50 border-sage-200 hover:border-sage-300"
    },
    {
      title: "Planned Litters",
      count: plannedLitters.count,
      icon: <PawPrint className="h-5 w-5 text-brown-600" />,
      highlight: plannedLitters.nextDate ? `Next: ${format(plannedLitters.nextDate, 'MMM d')}` : null,
      action: () => navigate("/planned-litters"),
      color: "bg-greige-50 border-greige-200 hover:border-greige-300"
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: <PawPrint className="h-5 w-5 text-blush-600" />,
      highlight: activePregnancies.length > 0 ? `${activePregnancies[0].daysLeft} days to due date` : null,
      action: () => navigate("/pregnancy"),
      color: "bg-blush-50 border-blush-200 hover:border-blush-300"
    },
    {
      title: "Recent Litters",
      count: recentLitters.count,
      icon: <Heart className="h-5 w-5 text-sage-600" />,
      highlight: recentLitters.latest ? `Latest: ${format(recentLitters.latest, 'MMM d')}` : null,
      action: () => navigate("/my-litters"),
      color: "bg-sage-100 border-sage-300 hover:border-sage-400"
    }
  ];
  
  return (
    <>
      <div className="rounded-lg overflow-hidden border border-greige-300 sage-gradient relative mt-2 animate-fade-in">
        {/* Personalized welcome message */}
        <div className="px-6 pt-4 pb-1 border-b border-greige-200">
          <h2 className="text-2xl font-le-jour text-primary">Welcome back, {username}!</h2>
          <p className="text-sm font-glacial text-muted-foreground">Here's an overview of your breeding program</p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-10">
          <PawPrint className="h-28 w-28 text-primary transform -rotate-12" />
        </div>
        
        <div className="p-4 md:p-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metricCards.map((card, index) => (
              <div 
                key={index} 
                className={`${card.color} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-scale-in`}
                onClick={card.action}
                style={{ animationDelay: `${index * 0.1}s` }}
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
                
                {/* Small decorative paw print */}
                <div className="absolute bottom-0 right-0 opacity-10">
                  <PawPrint className="h-12 w-12 text-primary transform rotate-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <RemindersDialog 
        open={remindersDialogOpen}
        onOpenChange={setRemindersDialogOpen}
      />
    </>
  );
};

export default DashboardHero;
