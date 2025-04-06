
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Check, X, UserPlus, UserX, AlertTriangle } from 'lucide-react';

// Mock co-owner interface
interface CoOwner {
  id: string;
  email: string;
  status: 'pending' | 'active';
  dateAdded: string;
}

const SharingSettings = () => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  
  React.useEffect(() => {
    // Mock loading subscription and co-owners
    const timer = setTimeout(() => {
      // In a real app, this would be fetched from your backend
      setSubscriptionStatus('inactive');
      
      // Mock co-owners data for demo
      if (Math.random() > 0.5) {
        setCoOwners([
          {
            id: '1',
            email: 'co-owner@example.com',
            status: 'active',
            dateAdded: '2023-03-15',
          }
        ]);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleInvite = () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    if (subscriptionStatus !== 'active') {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to invite co-owners",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Mock API call to invite co-owner
    setTimeout(() => {
      const newCoOwner: CoOwner = {
        id: Date.now().toString(),
        email: inviteEmail,
        status: 'pending',
        dateAdded: new Date().toISOString().split('T')[0],
      };
      
      setCoOwners([...coOwners, newCoOwner]);
      setInviteEmail('');
      setIsLoading(false);
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
    }, 1500);
  };
  
  const handleRemoveCoOwner = (id: string) => {
    if (confirm("Are you sure you want to remove this co-owner?")) {
      // In a real app, this would call your backend
      setCoOwners(coOwners.filter(owner => owner.id !== id));
      
      toast({
        title: "Co-owner Removed",
        description: "The co-owner has been removed from your kennel",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kennel Sharing</CardTitle>
        <CardDescription>
          Invite co-owners to collaborate on your kennel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionStatus === 'loading' ? (
          <div className="p-4 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : subscriptionStatus === 'inactive' ? (
          <div className="p-4 border rounded-md bg-muted flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Subscription Required</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Sharing your kennel with co-owners is a premium feature.
                Please subscribe to unlock this functionality.
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings?tab=account'}>
                View Subscription Options
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="inviteEmail" className="sr-only">
                  Email Address
                </Label>
                <Input
                  id="inviteEmail"
                  placeholder="Enter co-owner's email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleInvite} disabled={isLoading}>
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Invite
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium">
                Co-Owners ({coOwners.length})
              </div>
              {coOwners.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No co-owners yet. Invite someone to collaborate on your kennel.
                </div>
              ) : (
                <div className="divide-y">
                  {coOwners.map((coOwner) => (
                    <div key={coOwner.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{coOwner.email}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>Added on {coOwner.dateAdded}</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            {coOwner.status === 'active' ? (
                              <>
                                <Check className="h-3 w-3 text-green-500 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCoOwner(coOwner.id)}
                        title="Remove co-owner"
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SharingSettings;
