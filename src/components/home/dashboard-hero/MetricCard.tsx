
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Heart, PawPrint, Dog, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  icon: "calendar" | "heart" | "pawprint" | "dog" | "bell";
  label: string;
  value: string;
  highlightColor?: "green" | "blue" | "purple" | "rose" | "orange";
  trend?: string | React.ReactNode;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  highlightColor = "green",
  trend,
  loading = false
}) => {
  const renderIcon = () => {
    const iconClass = "h-5 w-5";
    
    switch (icon) {
      case "calendar":
        return <Calendar className={iconClass} />;
      case "heart":
        return <Heart className={iconClass} />;
      case "pawprint":
        return <PawPrint className={iconClass} />;
      case "dog":
        return <Dog className={iconClass} />;
      case "bell":
        return <Bell className={iconClass} />;
      default:
        return <Calendar className={iconClass} />;
    }
  };
  
  const getColorClasses = () => {
    switch (highlightColor) {
      case "green":
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-100",
          border: "border-emerald-200",
          iconBg: "bg-emerald-500/10"
        };
      case "blue":
        return {
          text: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          iconBg: "bg-blue-500/10"
        };
      case "purple":
        return {
          text: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          iconBg: "bg-purple-500/10"
        };
      case "rose":
        return {
          text: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          iconBg: "bg-rose-500/10"
        };
      case "orange":
        return {
          text: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-100",
          iconBg: "bg-orange-500/10"
        };
      default:
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-100",
          border: "border-emerald-200",
          iconBg: "bg-emerald-500/10"
        };
    }
  };
  
  const colors = getColorClasses();
  
  return (
    <Card className={`${colors.bg} border ${colors.border} shadow-sm hover:shadow-md transition-all p-4 flex`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`${colors.iconBg} p-2 rounded-full ${colors.text}`}>
            {renderIcon()}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        
        {loading ? (
          <>
            <Skeleton className="h-8 w-16 mb-2 bg-white/50" />
            <Skeleton className="h-3 w-24 bg-white/50" />
          </>
        ) : (
          <>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className={`text-xs ${colors.text}`}>{trend}</p>
          </>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
