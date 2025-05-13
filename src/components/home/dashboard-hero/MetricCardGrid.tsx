
import React from 'react';
import MetricCard from './MetricCard';

interface MetricCardData {
  title: string;
  count: number;
  icon: 'calendar' | 'heart' | 'pawprint' | 'dog';
  highlight: string | null;
  action: () => void;
  color?: string;
  loading?: boolean;
}

interface MetricCardGridProps {
  metricCards: MetricCardData[];
}

// For backward compatibility
interface LegacyMetricCardGridProps {
  remindersCount?: number;
  highPriorityCount?: number;
  plannedLittersCount?: number;
  nextHeatDate?: Date | null;
  activePregnanciesCount?: number;
  isLoadingPregnancies?: boolean;
  recentLittersCount?: number;
  recentLitterDate?: Date | null;
}

const MetricCardGrid: React.FC<MetricCardGridProps | LegacyMetricCardGridProps> = (props) => {
  // Check if we're receiving the new format or legacy format
  if ('metricCards' in props) {
    // New format with metricCards array
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {props.metricCards.map((card, index) => (
          <MetricCard 
            key={index}
            title={card.title}
            count={card.count ?? 0}
            icon={card.icon}
            highlight={card.highlight}
            action={card.action}
            loading={card.loading}
          />
        ))}
      </div>
    );
  } else {
    // Legacy format with individual props
    const {
      remindersCount = 0,
      highPriorityCount = 0,
      plannedLittersCount = 0,
      nextHeatDate = null,
      activePregnanciesCount = 0,
      isLoadingPregnancies = false,
      recentLittersCount = 0,
      recentLitterDate = null
    } = props;

    // Format dates for display
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    // Create metric cards data array from legacy props
    const metricCards: MetricCardData[] = [
      {
        title: 'Reminders',
        count: remindersCount,
        icon: 'calendar',
        highlight: highPriorityCount > 0 ? `${highPriorityCount} high priority` : null,
        action: () => console.log('View reminders'),
        loading: false
      },
      {
        title: 'Planned Litters',
        count: plannedLittersCount,
        icon: 'heart',
        highlight: nextHeatDate ? `Next heat: ${formatDate(nextHeatDate)}` : null,
        action: () => console.log('View planned litters'),
        loading: false
      },
      {
        title: 'Active Pregnancies',
        count: activePregnanciesCount,
        icon: 'pawprint',
        highlight: null,
        action: () => console.log('View pregnancies'),
        loading: isLoadingPregnancies
      },
      {
        title: 'Recent Litters',
        count: recentLittersCount,
        icon: 'dog',
        highlight: recentLitterDate ? `Latest: ${formatDate(recentLitterDate)}` : null,
        action: () => console.log('View litters'),
        loading: false
      }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((card, index) => (
          <MetricCard 
            key={index}
            title={card.title}
            count={card.count}
            icon={card.icon}
            highlight={card.highlight}
            action={card.action}
            loading={card.loading}
          />
        ))}
      </div>
    );
  }
};

export default MetricCardGrid;
