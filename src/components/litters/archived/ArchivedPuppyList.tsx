import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dog, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Puppy } from '@/types/breeding';

interface ArchivedPuppyListProps {
  puppies: Puppy[];
  litterId: string;
}

const ArchivedPuppyList: React.FC<ArchivedPuppyListProps> = ({ puppies, litterId }) => {
  const { t } = useTranslation('litters');
  const navigate = useNavigate();

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'Sold':
        return 'default';
      case 'Reserved':
        return 'secondary';
      case 'Kept':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusTranslation = (status?: string) => {
    const statusKey = status?.toLowerCase();
    // Map to correct translation key in puppies.statuses
    return t(`puppies.statuses.${statusKey}`, { defaultValue: status });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dog className="h-5 w-5 text-primary" />
          {t('archivedLitters.puppies.title')} ({puppies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {puppies.map((puppy) => (
            <Card 
              key={puppy.id} 
              className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => navigate(`/my-litters/${litterId}/puppy/${puppy.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={puppy.imageUrl} alt={puppy.name} />
                    <AvatarFallback>
                      {puppy.gender === 'male' ? '♂' : '♀'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold truncate">{puppy.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {puppy.gender === 'male' ? '♂ ' : '♀ '}
                          {t(`puppies.labels.${puppy.gender}`)}
                        </p>
                      </div>
                      {puppy.status && (
                        <Badge variant={getStatusVariant(puppy.status)} className="text-xs">
                          {getStatusTranslation(puppy.status)}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      {puppy.registered_name && (
                        <div className="flex items-start gap-1">
                          <span className="text-muted-foreground shrink-0">
                            {t('puppies.labels.registeredName')}:
                          </span>
                          <span className="font-medium truncate">
                            {puppy.registered_name}
                          </span>
                        </div>
                      )}

                      {puppy.registration_number && (
                        <div className="flex items-start gap-1">
                          <span className="text-muted-foreground shrink-0">
                            {t('archivedLitters.puppies.registrationNumber')}:
                          </span>
                          <span className="font-medium">{puppy.registration_number}</span>
                        </div>
                      )}

                      {(puppy.buyer_name || puppy.buyer_phone) && (
                        <div className="mt-2 pt-2 border-t space-y-1">
                          <p className="text-muted-foreground font-medium">
                            {t('archivedLitters.puppies.buyerInfo')}
                          </p>
                          {puppy.buyer_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{puppy.buyer_name}</span>
                            </div>
                          )}
                          {puppy.buyer_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{puppy.buyer_phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {puppies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('empty.noPuppies')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArchivedPuppyList;
