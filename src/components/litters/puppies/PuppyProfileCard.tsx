
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { BarChart2, Edit, Trash2, Scale, Ruler } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import { useIsMobile } from '@/hooks/use-mobile';

interface PuppyProfileCardProps {
  puppy: Puppy;
  onPuppyClick: (puppy: Puppy) => void;
  onAddMeasurement: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  isSelected?: boolean;
  litterAge: number;
  litterId: string;
}

const PuppyProfileCard: React.FC<PuppyProfileCardProps> = ({
  puppy,
  onPuppyClick,
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy,
  isSelected = false,
  litterAge,
  litterId
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get latest weight measurement
  const getLatestWeight = () => {
    if (puppy.weightLog && puppy.weightLog.length > 0) {
      const sortedWeights = [...puppy.weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedWeights[0].weight} kg`;
    }
    return puppy.currentWeight ? `${puppy.currentWeight} kg` : 'Not recorded';
  };

  // Get latest height measurement
  const getLatestHeight = () => {
    if (puppy.heightLog && puppy.heightLog.length > 0) {
      const sortedHeights = [...puppy.heightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedHeights[0].height} cm`;
    }
    return 'Not recorded';
  };

  // Get status badge
  const getStatusBadge = () => {
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="warning" className="text-sm px-4 py-1">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="success" className="text-sm px-4 py-1">Sold</Badge>;
      default:
        return <Badge variant="info" className="text-sm px-4 py-1">Available</Badge>;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${puppy.name}"?`)) {
      onDeletePuppy(puppy.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/my-litters/${litterId}/puppy/${puppy.id}`);
  };

  const handleMeasurementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddMeasurement(puppy);
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer bg-white ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={() => navigate(`/my-litters/${litterId}/puppy/${puppy.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Left side - Profile Picture and Name */}
          <div className="flex-shrink-0">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-warmbeige-200 shadow-sm mb-4">
              <AspectRatio ratio={1/1}>
                {puppy.imageUrl ? (
                  <img 
                    src={puppy.imageUrl} 
                    alt={puppy.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-warmgreen-100 text-warmgreen-800 font-semibold text-4xl w-full h-full flex items-center justify-center">
                    {puppy.name.charAt(0)}
                  </div>
                )}
              </AspectRatio>
            </div>

            {/* Puppy Name under picture */}
            <h3 className="text-2xl font-bold text-warmgreen-800 mb-2">
              Puppy {puppy.name.split(' ')[0]} – {puppy.name}
            </h3>
          </div>

          {/* Right side - Information */}
          <div className="flex-1 space-y-4">
            {/* Gender and Color Info */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                {puppy.gender === 'male' ? '♂' : '♀'} {puppy.gender}
              </span>
              <span>•</span>
              <span>{puppy.color}</span>
            </div>

            {/* Status Badge */}
            <div className="flex justify-end">
              {getStatusBadge()}
            </div>

            {/* Birth and Age Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Born: </span>
                <span className="font-medium">
                  {puppy.birthDateTime ? format(parseISO(puppy.birthDateTime), 'MMM d, yyyy') : 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Age: </span>
                <span className="font-medium">{litterAge} weeks</span>
              </div>
            </div>

            {/* Weight and Height Measurements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Weight</span>
                </div>
                <p className="text-lg font-semibold">{getLatestWeight()}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Height</span>
                </div>
                <p className="text-lg font-semibold">{getLatestHeight()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMeasurementClick}
                className="flex items-center gap-2 rounded-full px-4 py-2"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="flex items-center gap-2 rounded-full px-4 py-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full px-4 py-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyProfileCard;
