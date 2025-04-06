
import React from 'react';

export type DogBreed = 'border-collie' | 'shetland-sheepdog' | 'generic';

interface DogIllustrationProps {
  breed?: DogBreed;
  className?: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
  withBackground?: boolean;
}

const DogIllustration: React.FC<DogIllustrationProps> = ({
  breed = 'generic',
  className = '',
  size = 120,
  color = 'currentColor',
  secondaryColor = '#F0EDE5', // greige-100
  withBackground = false
}) => {
  // Simpler dog icon shapes for all breed types
  const illustrationData = {
    'shetland-sheepdog': {
      viewBox: '0 0 100 100',
      paths: [
        // Main dog shape - simple dog icon
        <path key="body" d="M50,30 C65,30 75,42 75,55 C75,68 65,80 50,80 C35,80 25,68 25,55 C25,42 35,30 50,30 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        
        // Simple dog ears
        <path key="ear-left" d="M35,38 C30,32 25,34 23,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M65,38 C70,32 75,34 77,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Simple face features
        <path key="eyes" d="M40,45 C41,44 43,44 44,45 M56,45 C57,44 59,44 60,45" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,55 C49,56 51,56 52,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M50,55 L50,60 M45,62 C48,64 52,64 55,62" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
      ]
    },
    'border-collie': {
      viewBox: '0 0 100 100',
      paths: [
        // Main dog shape - simple dog icon
        <path key="body" d="M50,30 C65,30 75,42 75,55 C75,68 65,80 50,80 C35,80 25,68 25,55 C25,42 35,30 50,30 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        
        // Simple dog ears
        <path key="ear-left" d="M35,38 C30,32 25,34 23,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M65,38 C70,32 75,34 77,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Simple face features
        <path key="eyes" d="M40,45 C41,44 43,44 44,45 M56,45 C57,44 59,44 60,45" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,55 C49,56 51,56 52,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M50,55 L50,60 M45,62 C48,64 52,64 55,62" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
      ]
    },
    'generic': {
      viewBox: '0 0 100 100',
      paths: [
        // Main dog shape - simple dog icon
        <path key="body" d="M50,30 C65,30 75,42 75,55 C75,68 65,80 50,80 C35,80 25,68 25,55 C25,42 35,30 50,30 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        
        // Simple dog ears
        <path key="ear-left" d="M35,38 C30,35 28,38 27,42" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M65,38 C70,35 72,38 73,42" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Simple face features
        <path key="eyes" d="M40,45 C41,44 43,44 44,45 M56,45 C57,44 59,44 60,45" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,55 C49,56 51,56 52,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M50,55 L50,60 M45,62 C48,64 52,64 55,62" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
      ]
    }
  };

  const { viewBox, paths } = illustrationData[breed];
  
  return (
    <svg 
      className={className} 
      viewBox={viewBox} 
      width={size} 
      height={size} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {withBackground && (
        <circle cx="50" cy="50" r="40" fill={secondaryColor} opacity="0.8" />
      )}
      {paths}
    </svg>
  );
};

export default DogIllustration;
