
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { Litter } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { toast } from '@/hooks/use-toast';
import DogLitterItem from './DogLitterItem';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface DogLittersSectionProps {
  dog: Dog;
}

const DogLittersSection: React.FC<DogLittersSectionProps> = ({ dog }) => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation('dogs');

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
          description: t('litters.error', { error: errorMessage }),
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
          <CardTitle className="text-lg">{t('litters.title', { dogName: dog.name })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>{t('litters.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('litters.title', { dogName: dog.name })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-center py-4">
            {t('litters.error', { error })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5" />
          {t('litters.title', { dogName: dog.name })}
        </CardTitle>
        <CardDescription>
          {t('litters.description', { 
            dogName: dog.name, 
            role: t(`litters.roles.${dog.gender === 'male' ? 'sire' : 'dam'}`)
          })}
          {litters.length > 0 && ` ${litters.length === 1 
            ? t('litters.count', { count: litters.length })
            : t('litters.countPlural', { count: litters.length })
          }`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {litters.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('litters.empty.title', { dogName: dog.name })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {dog.gender === 'male' 
                ? t('litters.empty.sireLine')
                : t('litters.empty.damLine')
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
