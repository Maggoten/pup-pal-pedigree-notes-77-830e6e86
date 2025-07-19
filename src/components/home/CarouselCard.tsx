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
      className={`h-48 bg-greige-50 border-greige-200 hover:shadow-md transition-all duration-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};