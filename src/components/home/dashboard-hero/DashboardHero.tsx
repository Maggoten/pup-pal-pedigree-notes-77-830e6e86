
import React, { useState } from 'react';
import MetricCardGrid from './MetricCardGrid';
import RemindersDialog from '@/components/reminders/RemindersDialog';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from './WelcomeHeader';
import DecorativePawprints from './DecorativePawprints';

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
  
  const metricCardsData = [
    {
      title: "Reminders",
      count: reminders.count,
      icon: "calendar",
      highlight: reminders.highPriority > 0 ? `${reminders.highPriority} high priority` : null,
      action: () => setRemindersDialogOpen(true),
      color: "bg-greige-50 border-greige-200 hover:border-greige-300"
    },
    {
      title: "Planned Litters",
      count: plannedLitters.count,
      icon: "heart",
      highlight: plannedLitters.nextDate ? `Next: ${format(plannedLitters.nextDate, 'MMM d')}` : null,
      action: () => navigate("/planned-litters"),
      color: "bg-greige-100 border-greige-200 hover:border-greige-300"
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: "pawprint",
      highlight: activePregnancies.length > 0 ? `${activePregnancies[0].daysLeft} days to due date` : null,
      action: () => navigate("/pregnancy"),
      color: "bg-greige-50 border-greige-200 hover:border-greige-300"
    },
    {
      title: "Recent Litters",
      count: recentLitters.count,
      icon: "dog",
      highlight: recentLitters.latest ? `Latest: ${format(recentLitters.latest, 'MMM d')}` : null,
      action: () => navigate("/my-litters"),
      color: "bg-greige-100 border-greige-200 hover:border-greige-300"
    }
  ];
  
  return (
    <>
      <div className="rounded-lg overflow-hidden border border-greige-300 beige-gradient relative mt-2 animate-fade-in">
        <WelcomeHeader username={username} />
        
        <DecorativePawprints />
        
        <div className="p-4 md:p-6 relative z-10">
          <MetricCardGrid metricCards={metricCardsData} />
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
