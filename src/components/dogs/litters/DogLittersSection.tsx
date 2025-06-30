
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { Litter } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { toast } from '@/hooks/use-toast';
import DogLitterItem from './DogLitterItem';
import { useNavigate } from 'react-router-dom';

interface DogLittersSectionProps {
  dog: Dog;
}

const DogLittersSection: React.FC<DogLittersSectionProps> = ({ dog }) => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDogLitters = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching litters for dog: ${dog.id} (${dog.name})`);
        
        const dogLitters = await litterService.getDogLitters(dog.id);
        setLitters(dogLitters);
        
        console.log(`Found ${dogLitters.length} litters for ${dog.name}`);
      } catch (err) {
        console.error('Error fetching dog litters:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load litters';
        setError(errorMessage);
        toast({
          title: "Error",
          description: `Failed to load ${dog.name}'s litters: ${errorMessage}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDogLitters();
  }, [dog.id, dog.name]);

  const handleViewDetails = (litter: Litter) => {
    // Navigate to MyLitters page with the selected litter
    navigate('/my-litters', { 
      state: { selectedLitterId: litter.id } 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dog.name}'s Litters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading litters...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dog.name}'s Litters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-center py-4">
            Error loading litters: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          {dog.name}'s Litters
        </CardTitle>
        <CardDescription>
          All litters where {dog.name} is involved as {dog.gender === 'male' ? 'sire' : 'dam'}
          {litters.length > 0 && ` (${litters.length} litter${litters.length === 1 ? '' : 's'})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {litters.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {dog.name} hasn't been involved in any litters yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {dog.gender === 'male' 
                ? 'When this dog sires a litter, it will appear here.'
                : 'When this dog has a litter, it will appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {litters.map((litter) => (
              <DogLitterItem
                key={litter.id}
                litter={litter}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DogLittersSection;
