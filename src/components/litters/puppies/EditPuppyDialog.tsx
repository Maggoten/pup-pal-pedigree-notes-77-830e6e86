import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import PuppyImageUploader from './PuppyImageUploader';

interface EditPuppyDialogProps {
  puppy: Puppy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePuppy: (puppy: Puppy) => Promise<void>;
}

const EditPuppyDialog: React.FC<EditPuppyDialogProps> = ({
  puppy,
  open,
  onOpenChange,
  onUpdatePuppy
}) => {
  const [formData, setFormData] = useState({
    name: puppy.name || '',
    gender: puppy.gender || 'male',
    color: puppy.color || '',
    markings: puppy.markings || '',
    microchip: puppy.microchip || '',
    collar: puppy.collar || '',
    status: puppy.status || 'Available',
    newOwner: puppy.newOwner || '',
    birthDateTime: puppy.birthDateTime ? format(new Date(puppy.birthDateTime), "yyyy-MM-dd'T'HH:mm") : '',
    currentWeight: puppy.currentWeight?.toString() || '',
    birthWeight: puppy.birthWeight?.toString() || '',
    imageUrl: puppy.imageUrl || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPuppy: Puppy = {
      ...puppy,
      name: formData.name,
      gender: formData.gender as 'male' | 'female',
      color: formData.color,
      markings: formData.markings || null,
      microchip: formData.microchip || '',
      collar: formData.collar || '',
      status: formData.status as 'Available' | 'Reserved' | 'Sold',
      newOwner: formData.newOwner || null,
      birthDateTime: formData.birthDateTime ? new Date(formData.birthDateTime).toISOString() : puppy.birthDateTime,
      currentWeight: formData.currentWeight ? parseFloat(formData.currentWeight) : puppy.currentWeight,
      birthWeight: formData.birthWeight ? parseFloat(formData.birthWeight) : puppy.birthWeight,
      imageUrl: formData.imageUrl
    };

    await onUpdatePuppy(updatedPuppy);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Puppy Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            <div className="flex justify-center">
              <PuppyImageUploader
                puppyName={formData.name}
                currentImage={formData.imageUrl}
                onImageChange={(url) => setFormData({ ...formData, imageUrl: url })}
                large
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="markings">Markings</Label>
                <Input
                  id="markings"
                  value={formData.markings}
                  onChange={(e) => setFormData({ ...formData, markings: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDateTime">Birth Date & Time</Label>
              <Input
                id="birthDateTime"
                type="datetime-local"
                value={formData.birthDateTime}
                onChange={(e) => setFormData({ ...formData, birthDateTime: e.target.value })}
              />
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Physical Measurements</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthWeight">Birth Weight (kg)</Label>
                <Input
                  id="birthWeight"
                  type="number"
                  step="0.001"
                  value={formData.birthWeight}
                  onChange={(e) => setFormData({ ...formData, birthWeight: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  step="0.001"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identification</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="microchip">Microchip Number</Label>
                <Input
                  id="microchip"
                  value={formData.microchip}
                  onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collar">Collar</Label>
                <Input
                  id="collar"
                  value={formData.collar}
                  onChange={(e) => setFormData({ ...formData, collar: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Status & Owner */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status & Ownership</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Available' | 'Reserved' | 'Sold') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === 'Reserved' || formData.status === 'Sold') && (
              <div className="space-y-2">
                <Label htmlFor="newOwner">New Owner Information</Label>
                <Textarea
                  id="newOwner"
                  value={formData.newOwner}
                  onChange={(e) => setFormData({ ...formData, newOwner: e.target.value })}
                  placeholder="Enter owner name, contact information, etc."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPuppyDialog;