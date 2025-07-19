
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, HelpCircle } from 'lucide-react';

const HelpSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support & Contact
          </CardTitle>
          <CardDescription>
            Get help and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Need help?</p>
            <p className="text-sm text-muted-foreground">
              If you have any questions or need assistance, feel free to contact our support team.
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
              <Mail className="h-4 w-4 text-primary" />
              <a 
                href="mailto:support@breedingjourney.com" 
                className="text-sm text-primary hover:underline"
              >
                support@breedingjourney.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Application information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Breeding Journey. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSettings;
