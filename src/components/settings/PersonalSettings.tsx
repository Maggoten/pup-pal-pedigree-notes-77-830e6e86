
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { UserSettings } from '@/types/settings';

interface PersonalSettingsProps {
  settings: UserSettings | null;
}

const PersonalSettings: React.FC<PersonalSettingsProps> = ({ settings }) => {
  const [firstName, setFirstName] = useState(settings?.profile.first_name || '');
  const [lastName, setLastName] = useState(settings?.profile.last_name || '');
  const [kennelName, setKennelName] = useState(settings?.profile.kennel_name || '');
  const [address, setAddress] = useState(settings?.profile.address || '');
  const [phone, setPhone] = useState(settings?.profile.phone || '');
  
  // Get functions from useSettings hook
  const { updatePersonalInfo, updateKennelInfo, isUpdatingPersonal, isUpdatingKennel } = useSettings();
  
  // Handle personal info update
  const handleUpdatePersonalInfo = async () => {
    await updatePersonalInfo({
      firstName,
      lastName
    });
  };
  
  // Handle kennel info update
  const handleUpdateKennelInfo = async () => {
    await updateKennelInfo({
      kennelName,
      address,
      phone
    });
  };
  
  if (!settings) {
    return <div className="text-center p-4">Loading personal settings...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={settings.profile.email} disabled />
            <p className="text-xs text-muted-foreground mt-1">
              Your email cannot be changed
            </p>
          </div>
          
          <Button 
            onClick={handleUpdatePersonalInfo} 
            disabled={isUpdatingPersonal}
          >
            {isUpdatingPersonal ? 'Saving...' : 'Save Personal Info'}
          </Button>
        </div>
      </div>
      
      {/* Kennel Information */}
      <div>
        <h3 className="text-lg font-medium">Kennel Information</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kennelName">Kennel Name</Label>
            <Input 
              id="kennelName" 
              value={kennelName} 
              onChange={(e) => setKennelName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          
          <Button 
            onClick={handleUpdateKennelInfo} 
            disabled={isUpdatingKennel}
          >
            {isUpdatingKennel ? 'Saving...' : 'Save Kennel Info'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalSettings;
