
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Litter } from '@/types/breeding';
import LitterCard from './LitterCard';
import { dogImageService } from '@/services/dogImageService';

interface LitterGridViewProps {
  litters: Litter[];
  onSelectLitter: (litter: Litter) => void;
  onArchive: (litter: Litter) => void;
  selectedLitterId: string | null;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

const LitterGridView: React.FC<LitterGridViewProps> = ({
  litters,
  onSelectLitter,
  onArchive,
  selectedLitterId,
  hasMore = false,
  loadingMore = false,
  onLoadMore
}) => {
  const [dogImages, setDogImages] = useState<Record<string, string | null>>({});
  const [loadingImages, setLoadingImages] = useState(false);

  // Fetch dog images when litters change
  useEffect(() => {
    const fetchDogImages = async () => {
      if (!litters.length) return;
      
      setLoadingImages(true);
      
      // Extract unique dam IDs from litters
      const damIds = [...new Set(litters.map(litter => litter.damId).filter(Boolean))];
      
      if (damIds.length > 0) {
        const images = await dogImageService.getDogImages(damIds);
        setDogImages(images);
      }
      
      setLoadingImages(false);
    };

    fetchDogImages();
  }, [litters]);

  if (litters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No litters found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {litters.map((litter) => (
          <LitterCard
            key={litter.id}
            litter={litter}
            onSelect={onSelectLitter}
            onArchive={onArchive}
            isSelected={selectedLitterId === litter.id}
            damImageUrl={litter.damId ? dogImages[litter.damId] : undefined}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LitterGridView;
