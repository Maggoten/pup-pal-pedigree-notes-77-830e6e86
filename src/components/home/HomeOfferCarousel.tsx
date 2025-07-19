import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useUserStats } from '@/hooks/useUserStats';
import { usePartnerOffers } from '@/hooks/usePartnerOffers';
import { UserStatsCard } from './UserStatsCard';
import { PartnerOfferCard } from './PartnerOfferCard';
import { FallbackTipCard, getRandomFallbackTips } from './FallbackTipCard';

export const HomeOfferCarousel: React.FC = () => {
  // ALL hooks must be called at the top before any conditional returns
  const { stats, isLoading: statsLoading } = useUserStats();
  const { offers, isLoading: offersLoading } = usePartnerOffers();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      skipSnaps: false
    },
    [Autoplay({ delay: 8000, stopOnInteraction: true })]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', updateSelectedIndex);
    updateSelectedIndex();
  }, [emblaApi, updateSelectedIndex]);

  // NOW we can do conditional returns after all hooks are called

  if (statsLoading || offersLoading) {
    return (
      <div className="rounded-lg bg-card border border-border p-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  // Build carousel content
  const carouselItems = [];

  // Always add user stats as first item
  carouselItems.push(
    <div key="user-stats" className="flex-[0_0_100%] min-w-0">
      <UserStatsCard
        totalLitters={stats.totalLitters}
        totalPuppies={stats.totalPuppies}
        averageLitterSize={stats.averageLitterSize}
      />
    </div>
  );

  // Add partner offers if available
  offers.forEach((offer) => {
    carouselItems.push(
      <div key={offer.id} className="flex-[0_0_100%] min-w-0">
        <PartnerOfferCard
          title={offer.title}
          imageUrl={offer.image_url}
          link={offer.link}
        />
      </div>
    );
  });

  // Add fallback tips if no offers or to fill content
  if (offers.length === 0) {
    const fallbackTips = getRandomFallbackTips(2);
    fallbackTips.forEach((tip, index) => {
      carouselItems.push(
        <div key={`tip-${index}`} className="flex-[0_0_100%] min-w-0">
          <FallbackTipCard tip={tip.text} type={tip.type} />
        </div>
      );
    });
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {carouselItems}
        </div>
      </div>
      
      {/* Navigation dots */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === selectedIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};