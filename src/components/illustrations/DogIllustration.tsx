
import React from 'react';
import { Heart } from 'lucide-react';

export type DogBreed = 'border-collie' | 'shetland-sheepdog' | 'generic';

interface DogIllustrationProps {
  breed?: DogBreed;
  className?: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
  withBackground?: boolean;
  filled?: boolean;
}

const DogIllustration: React.FC<DogIllustrationProps> = ({
  breed = 'generic',
  className = '',
  size = 120,
  color = 'currentColor',
  secondaryColor = '#F0EDE5', // greige-100
  withBackground = false,
  filled = false
}) => {
  // Use heart icon for all breed types with slight variations
  const heartSize = Math.floor(size * 0.7); // Adjust heart size relative to the container
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {withBackground && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: secondaryColor, opacity: 0.8 }}
        />
      )}
      
      <Heart 
        size={heartSize} 
        color={color}
        className={`transform ${breed === 'border-collie' ? 'rotate-12' : breed === 'shetland-sheepdog' ? '-rotate-12' : ''}`}
        fill={filled ? color : breed === 'border-collie' ? 'rgba(255,0,0,0.1)' : breed === 'shetland-sheepdog' ? 'rgba(255,0,0,0.2)' : 'transparent'}
        strokeWidth={breed === 'generic' ? 2 : 1.5}
      />
    </div>
  );
};

export default DogIllustration;
