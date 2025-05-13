
import React, { useState } from 'react';
import MetricCardGrid from './MetricCardGrid';
import RemindersDialog from '@/components/reminders/RemindersDialog';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from './WelcomeHeader';
import DecorativePawprints from './DecorativePawprints';
import { User } from '@/types/auth';

interface DashboardHeroProps {
  username: string;
  user: User | null;
  reminders: { count: number; highPriority: number };
  plannedLitters: { count: number; nextDate: Date | null };
  activePregnancies: ActivePregnancy[];
  recentLitters: { count: number; latest: Date | null };
  isLoadingPregnancies?: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ 
  username, 
  user,
  reminders,
  plannedLitters,
  activePregnancies,
  recentLitters,
  isLoadingPregnancies = false
}) => {
  const navigate = useNavigate();
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  
  const metricCardsData = [
    {
      title: "Reminders",
      count: reminders.count,
      icon: "calendar" as const,
      highlight: reminders.highPriority > 0 ? `${reminders.highPriority} high priority` : null,
      action: () => setRemindersDialogOpen(true),
      loading: false
    },
    {
      title: "Planned Litters",
      count: plannedLitters.count,
      icon: "heart" as const,
      highlight: plannedLitters.nextDate ? `Next: ${format(plannedLitters.nextDate, 'MMM d')}` : null,
      action: () => navigate("/planned-litters"),
      loading: false
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: "pawprint" as const,
      highlight: activePregnancies.length > 0 ? `${activePregnancies[0].daysLeft} days to due date` : null,
      action: () => navigate("/pregnancy"),
      loading: isLoadingPregnancies
    },
    {
      title: "Recent Litters",
      count: recentLitters.count,
      icon: "dog" as const,
      highlight: recentLitters.latest ? `Latest: ${format(recentLitters.latest, 'MMM d')}` : null,
      action: () => navigate("/my-litters"),
      loading: false
    }
  ];
  
  return (
    <>
      <div className="rounded-lg overflow-hidden border border-greige-300 beige-gradient relative mt-2 animate-fade-in">
        <WelcomeHeader username={username} user={user} />
        
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
