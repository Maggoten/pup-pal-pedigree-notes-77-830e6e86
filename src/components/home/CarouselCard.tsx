import React from 'react';
import { Card } from '@/components/ui/card';

interface CarouselCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ 
  children, 
  onClick, 
  className = "" 
}) => {
  return (
    <Card 
      className={`bg-card border-border hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};