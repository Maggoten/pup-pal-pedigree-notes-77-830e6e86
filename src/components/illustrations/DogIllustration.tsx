
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
  // Illustration data with more realistic dog shapes
  const illustrationData = {
    'shetland-sheepdog': {
      viewBox: '0 0 100 100',
      paths: [
        // Main head shape - rounder for Sheltie
        <path key="head" d="M50,25 C60,25 70,35 70,45 C70,55 65,65 50,65 C35,65 30,55 30,45 C30,35 40,25 50,25 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        
        // Sheltie's distinctive pointed muzzle
        <path key="muzzle" d="M40,50 C45,58 55,58 60,50 C60,55 55,62 50,62 C45,62 40,55 40,50 Z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Sheltie's small, partially folded ears
        <path key="ear-left" d="M37,35 C32,32 25,34 23,42" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M63,35 C68,32 75,34 77,42" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Eyes - almond shaped for Shelties
        <path key="eye-left" d="M40,40 C42,38 44,38 46,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M54,40 C56,38 58,38 60,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Nose and mouth
        <path key="nose" d="M48,50 C49,51 51,51 52,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M50,50 L50,54 M46,56 C48,58 52,58 54,56" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Sheltie's distinctive mane and ruff
        <path key="mane" d="M30,45 C25,55 25,65 35,75 C42,80 58,80 65,75 C75,65 75,55 70,45" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" />,
        
        // Facial markings - white blaze
        <path key="blaze" d="M50,40 L50,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
      ]
    },
    'border-collie': {
      viewBox: '0 0 100 100',
      paths: [
        // Main head shape - slightly more elongated
        <path key="head" d="M50,25 C62,25 70,35 70,45 C70,58 62,65 50,65 C38,65 30,58 30,45 C30,35 38,25 50,25 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        
        // Border collie's longer muzzle
        <path key="muzzle" d="M40,50 C45,58 55,58 60,50 C60,55 55,63 50,63 C45,63 40,55 40,50 Z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Border collie's erect, pointed ears
        <path key="ear-left" d="M37,35 C33,30 28,30 25,38" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M63,35 C67,30 72,30 75,38" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Eyes - intense, almond-shaped
        <path key="eye-left" d="M40,40 C42,38 44,38 46,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M54,40 C56,38 58,38 60,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Nose and mouth
        <path key="nose" d="M48,50 C49,51 51,51 52,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M50,50 L50,54 M46,56 C48,58 52,58 54,56" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Border collie's thick coat but less pronounced ruff
        <path key="coat" d="M30,45 C28,55 30,65 35,72 C42,78 58,78 65,72 C70,65 72,55 70,45" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2" />,
        
        // Border collie facial markings - distinctive white blaze and split face
        <path key="markings" d="M50,30 L50,50 M42,35 C40,40 40,45 42,50 M58,35 C60,40 60,45 58,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
      ]
    },
    'generic': {
      viewBox: '0 0 100 100',
      paths: [
        // Main head shape - more rounded like a beagle
        <path key="head" d="M50,25 C62,25 70,35 70,48 C70,60 60,65 50,65 C40,65 30,60 30,48 C30,35 38,25 50,25 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        
        // Generic shorter muzzle
        <path key="muzzle" d="M40,50 C45,57 55,57 60,50 C60,55 55,60 50,60 C45,60 40,55 40,50 Z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Generic floppy ears like a beagle
        <path key="ear-left" d="M35,35 C30,35 25,40 25,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M65,35 C70,35 75,40 75,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Rounded, friendly eyes
        <path key="eye-left" d="M40,42 C41,40 43,40 44,42" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M56,42 C57,40 59,40 60,42" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Nose and mouth
        <path key="nose" d="M48,50 C49,51 51,51 52,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M50,50 L50,53 M45,55 C48,57 52,57 55,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        
        // Generic shorter coat
        <path key="coat" d="M35,48 C30,55 32,65 38,70 C42,75 58,75 62,70 C68,65 70,55 65,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3" />,
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
