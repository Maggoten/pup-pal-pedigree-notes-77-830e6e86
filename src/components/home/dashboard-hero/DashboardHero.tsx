
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
  reminders: { count: number; highPriority: number } | undefined;
  plannedLitters: { count: number; nextDate: Date | null } | undefined;
  activePregnancies: ActivePregnancy[];
  recentLitters: { count: number; latest: Date | null } | undefined;
  isLoadingPregnancies?: boolean;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  username,
  reminders,
  plannedLitters,
  activePregnancies,
  recentLitters,
  isLoadingPregnancies = false
}) => {
  const navigate = useNavigate();
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);

  // Säkerställ att vi alltid har giltiga objekt
  const safeReminders      = reminders      ?? { count: 0, highPriority: 0 };
  const safePlannedLitters = plannedLitters ?? { count: 0, nextDate: null };
  const safeRecentLitters  = recentLitters  ?? { count: 0, latest: null };

  const metricCardsData = [
    {
      title: "Reminders",
      count: safeReminders.count,
      icon: "calendar" as const,
      highlight:
        safeReminders.highPriority > 0
          ? `${safeReminders.highPriority} high priority`
          : null,
      action: () => setRemindersDialogOpen(true),
      loading: false
    },
    {
      title: "Planned Litters",
      count: safePlannedLitters.count,
      icon: "heart" as const,
      highlight: safePlannedLitters.nextDate
        ? `Next: ${format(safePlannedLitters.nextDate, 'MMM d')}`
        : null,
      action: () => navigate("/planned-litters"),
      loading: false
    },
    {
      title: "Active Pregnancies",
      count: activePregnancies.length,
      icon: "pawprint" as const,
      highlight:
        activePregnancies.length > 0
          ? `${activePregnancies[0].daysLeft} days to due date`
          : null,
      action: () => navigate("/pregnancy"),
      loading: isLoadingPregnancies
    },
    {
      title: "Recent Litters",
      count: safeRecentLitters.count,
      icon: "dog" as const,
      highlight: safeRecentLitters.latest
        ? `Latest: ${format(safeRecentLitters.latest, 'MMM d')}`
        : null,
      action: () => navigate("/my-litters"),
      loading: false
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
