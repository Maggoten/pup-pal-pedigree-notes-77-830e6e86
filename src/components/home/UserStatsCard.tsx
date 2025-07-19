import React from 'react';
import { TrendingUp, Heart, Award } from 'lucide-react';
import { CarouselCard } from './CarouselCard';

interface UserStatsCardProps {
  totalLitters: number;
  totalPuppies: number;
  averageLitterSize: number;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  totalLitters,
  totalPuppies,
  averageLitterSize
}) => {
  const currentYear = new Date().getFullYear();
  const hasData = totalLitters > 0;

  if (!hasData) {
    return (
      <CarouselCard className="p-6 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Your {currentYear} Journey
          </h3>
          <p className="text-sm text-muted-foreground">
            You haven't recorded any litters in {currentYear} yet – your journey starts soon!
          </p>
        </div>
      </CarouselCard>
    );
  }

  return (
    <CarouselCard className="p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Your {currentYear} Stats
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalLitters}</div>
            <div className="text-xs text-muted-foreground">Litters</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalPuppies}</div>
            <div className="text-xs text-muted-foreground">Puppies</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{averageLitterSize}</div>
            <div className="text-xs text-muted-foreground">Avg Size</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>Keep up the great work!</span>
        </div>
      </div>
    </CarouselCard>
  );
};