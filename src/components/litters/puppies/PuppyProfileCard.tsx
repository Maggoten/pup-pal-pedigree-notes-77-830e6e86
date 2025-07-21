
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
        return <Badge variant="warning" className="text-xs">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="success" className="text-xs">Sold</Badge>;
      default:
        return <Badge variant="info" className="text-xs">Available</Badge>;
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
      <CardContent className="p-4">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Image Section */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-warmbeige-200 shadow-sm">
              <AspectRatio ratio={1/1}>
                {puppy.imageUrl ? (
                  <img 
                    src={puppy.imageUrl} 
                    alt={puppy.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-warmgreen-100 text-warmgreen-800 font-semibold text-2xl w-full h-full flex items-center justify-center">
                    {puppy.name.charAt(0)}
                  </div>
                )}
              </AspectRatio>
            </div>
          </div>

          {/* Header Info */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-warmgreen-800">
              {puppy.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {puppy.gender === 'male' ? '♂' : '♀'} {puppy.gender} • {puppy.color}
            </p>
            <div className="flex justify-center">
              {getStatusBadge()}
            </div>
          </div>

          {/* Measurements Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-warmbeige-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Scale className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Weight</span>
              </div>
              <p className="text-sm font-medium">{getLatestWeight()}</p>
            </div>
            
            <div className="bg-warmbeige-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Ruler className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Height</span>
              </div>
              <p className="text-sm font-medium">{getLatestHeight()}</p>
            </div>
          </div>

          {/* Birth Info */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Born: {puppy.birthDateTime ? format(parseISO(puppy.birthDateTime), 'MMM d, yyyy') : 'Not set'}</p>
            <p>Age: {litterAge} weeks</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMeasurementClick}
              className="flex items-center gap-1 text-xs px-2 py-1 h-8"
            >
              <BarChart2 className="h-3 w-3" />
              Measure
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex items-center gap-1 text-xs px-2 py-1 h-8"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs px-2 py-1 h-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyProfileCard;
