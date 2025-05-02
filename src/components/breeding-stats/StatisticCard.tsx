
import React from 'react';
import { Heart, Baby, Dog, PieChart } from 'lucide-react';

interface StatisticCardProps {
  type: 'litters' | 'puppies' | 'dogs' | 'averageLitter';
  value: number;
  label: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ type, value, label }) => {
  const config = {
    litters: {
      icon: <Heart className="h-5 w-5" />,
      color: "text-rose-500 bg-rose-50"
    },
    puppies: {
      icon: <Baby className="h-5 w-5" />,
      color: "text-amber-500 bg-amber-50"
    },
    dogs: {
      icon: <Dog className="h-5 w-5" />,
      color: "text-green-500 bg-green-50"
    },
    averageLitter: {
      icon: <PieChart className="h-5 w-5" />,
      color: "text-blue-500 bg-blue-50"
    }
  };

  const { icon, color } = config[type];

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

// Export the PieChart icon separately for reuse in the header
StatisticCard.PieChartIcon = () => <PieChart className="h-5 w-5" />;

export default StatisticCard;
