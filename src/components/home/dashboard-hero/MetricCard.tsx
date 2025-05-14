
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { 
  Calendar, 
  Heart, 
  Bell, 
  PawPrint, 
  Dog 
} from 'lucide-react';

export interface MetricCardProps {
  icon: "calendar" | "heart" | "pawprint" | "dog" | "bell";
  label: string;
  value: string;
  highlightColor: string;
  trend: string;
  loading: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  label, 
  value, 
  highlightColor, 
  trend,
  loading
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'heart':
        return <Heart className="h-5 w-5" />;
      case 'bell':
        return <Bell className="h-5 w-5" />;
      case 'pawprint':
        return <PawPrint className="h-5 w-5" />;
      case 'dog':
        return <Dog className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-warmbeige-200 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="flex items-end mt-2">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <h3 className={`text-3xl font-bold ${highlightColor}`}>
                  {value}
                </h3>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">{trend}</p>
          </div>
          <div className="bg-warmbeige-100 p-2 rounded-full">
            {renderIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
