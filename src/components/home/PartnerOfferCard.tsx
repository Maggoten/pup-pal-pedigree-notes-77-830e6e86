import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CarouselCard } from './CarouselCard';

interface PartnerOfferCardProps {
  title: string;
  imageUrl: string;
  link?: string;
}

export const PartnerOfferCard: React.FC<PartnerOfferCardProps> = ({
  title,
  imageUrl,
  link
}) => {
  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <CarouselCard 
      onClick={link ? handleClick : undefined} 
      className={`overflow-hidden ${link ? 'hover:scale-[1.02]' : ''}`}
    >
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-32 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {link && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
            <ExternalLink className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-card-foreground line-clamp-2">
          {title}
        </h3>
      </div>
    </CarouselCard>
  );
};