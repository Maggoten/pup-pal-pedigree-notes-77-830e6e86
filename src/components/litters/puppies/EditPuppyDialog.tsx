import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
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
  const {
    t
  } = useTranslation('litters');
  const [formData, setFormData] = useState({
    name: puppy.name || '',
    registered_name: puppy.registered_name || '',
    registration_number: puppy.registration_number || '',
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
    imageUrl: puppy.imageUrl || '',
    deathDate: puppy.deathDate ? format(new Date(puppy.deathDate), "yyyy-MM-dd") : ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPuppy: Puppy = {
      ...puppy,
      name: formData.name,
      registered_name: formData.registered_name,
      registration_number: formData.registration_number,
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
      imageUrl: formData.imageUrl,
      deathDate: formData.deathDate ? new Date(formData.deathDate).toISOString() : undefined
    };
    await onUpdatePuppy(updatedPuppy);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('puppies.titles.editPuppyInformation')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-4">
            
            <div className="flex justify-center">
              <PuppyImageUploader puppyName={formData.name} currentImage={formData.imageUrl} onImageChange={url => setFormData({
              ...formData,
              imageUrl: url
            })} large />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('puppies.titles.basicInformation')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('puppies.labels.name')} *</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registered_name">{t('puppies.labels.registeredName')}</Label>
                <Input id="registered_name" value={formData.registered_name} onChange={e => setFormData({
                ...formData,
                registered_name: e.target.value
              })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">{t('puppies.labels.gender')} *</Label>
                <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => setFormData({
                ...formData,
                gender: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('puppies.labels.male')}</SelectItem>
                    <SelectItem value="female">{t('puppies.labels.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">{t('puppies.labels.color')}</Label>
                <Input id="color" value={formData.color} onChange={e => setFormData({
                ...formData,
                color: e.target.value
              })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="markings">{t('puppies.labels.markings')}</Label>
                <Input id="markings" value={formData.markings} onChange={e => setFormData({
                ...formData,
                markings: e.target.value
              })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDateTime">{t('puppies.labels.birthDateTime')}</Label>
              <Input id="birthDateTime" type="datetime-local" value={formData.birthDateTime} onChange={e => setFormData({
              ...formData,
              birthDateTime: e.target.value
            })} />
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('puppies.titles.physicalMeasurements')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthWeight">{t('puppies.labels.birthWeight')}</Label>
                <Input id="birthWeight" type="number" step="0.001" value={formData.birthWeight} onChange={e => setFormData({
                ...formData,
                birthWeight: e.target.value
              })} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentWeight">{t('puppies.labels.currentWeight')}</Label>
                <Input id="currentWeight" type="number" step="0.001" value={formData.currentWeight} onChange={e => setFormData({
                ...formData,
                currentWeight: e.target.value
              })} />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('puppies.titles.identification')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">{t('puppies.labels.registrationNumber')}</Label>
                <Input id="registrationNumber" value={formData.registration_number} onChange={e => setFormData({
                ...formData,
                registration_number: e.target.value
              })} placeholder={t('puppies.placeholders.registrationNumber')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="microchip">{t('puppies.labels.microchipNumber')}</Label>
                <Input id="microchip" value={formData.microchip} onChange={e => setFormData({
                ...formData,
                microchip: e.target.value
              })} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collar">{t('puppies.labels.collar')}</Label>
                <Input id="collar" value={formData.collar} onChange={e => setFormData({
                ...formData,
                collar: e.target.value
              })} />
              </div>
            </div>
          </div>

          {/* Status & Owner */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('puppies.titles.statusAndOwnership')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">{t('puppies.labels.status')}</Label>
              <Select value={formData.status} onValueChange={(value: 'Available' | 'Reserved' | 'Sold') => setFormData({
              ...formData,
              status: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">{t('puppies.statuses.available')}</SelectItem>
                  <SelectItem value="Reserved">{t('puppies.statuses.reserved')}</SelectItem>
                  <SelectItem value="Sold">{t('puppies.statuses.sold')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === 'Reserved' || formData.status === 'Sold') && <div className="space-y-2">
                <Label htmlFor="newOwner">{t('puppies.labels.newOwnerInformation')}</Label>
                <Textarea id="newOwner" value={formData.newOwner} onChange={e => setFormData({
              ...formData,
              newOwner: e.target.value
            })} placeholder={t('puppies.placeholders.enterOwnerInfo')} rows={3} />
              </div>}
          </div>

          {/* Deceased Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Checkbox id="is_deceased" checked={!!formData.deathDate} onCheckedChange={checked => {
              if (!checked) {
                setFormData({
                  ...formData,
                  deathDate: ''
                });
              }
            }} />
              <Label htmlFor="is_deceased" className="text-sm font-medium cursor-pointer">
                {t('puppies.labels.deceased')}
              </Label>
            </div>
            
            {formData.deathDate && <div className="space-y-2 animate-in fade-in-50 duration-300">
                <Label htmlFor="death_date">{t('puppies.labels.deathDate')}</Label>
                <Input id="death_date" type="date" value={formData.deathDate} onChange={e => setFormData({
              ...formData,
              deathDate: e.target.value
            })} />
              </div>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit">
              {t('puppies.actions.saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default EditPuppyDialog;