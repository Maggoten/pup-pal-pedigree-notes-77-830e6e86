
import React from 'react';
import { Calendar, Heart, PawPrint, Dog } from 'lucide-react';

interface MetricCardProps {
  title: string;
  count: number;
  icon: string;
  highlight: string | null;
  onClick: () => void;
  color: string;
  animationDelay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  icon,
  highlight,
  onClick,
  color,
  animationDelay
}) => {
  const iconMap = {
    calendar: <Calendar className="h-5 w-5 text-primary" />,
    heart: <Heart className="h-5 w-5 text-primary" />,
    pawprint: <PawPrint className="h-5 w-5 text-primary" />,
    dog: <Dog className="h-5 w-5 text-primary" />
  };

  return (
    <div 
      className={`${color} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden animate-scale-in`}
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="flex items-center gap-2 mb-1.5 relative z-10">
        <div className="p-1.5 bg-white/50 rounded-full">
          {iconMap[icon as keyof typeof iconMap]}
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="text-2xl font-bold relative z-10">{count}</div>
      {highlight && (
        <div className="text-xs text-muted-foreground mt-1 relative z-10">{highlight}</div>
      )}
      
      {/* Small decorative paw print */}
      <div className="absolute bottom-0 right-0 opacity-10">
        <PawPrint className="h-12 w-12 text-primary transform rotate-12" />
      </div>
    </div>
  );
};

export default MetricCard;
