
import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { getDisplayUsername } from '@/utils/userDisplayUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface WelcomeHeaderProps {
  username?: string;
  user?: User | null;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username, user }) => {
  const [displayName, setDisplayName] = useState<string>(username || 'Breeder');
  const [loading, setLoading] = useState(!username && !!user);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        setLoading(true);
        try {
          const name = await getDisplayUsername(user);
          setDisplayName(name);
        } catch (error) {
          console.error('Error fetching username:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (!username) {
      fetchUsername();
    }
  }, [user, username]);

  return (
    <div className="px-4 pb-4 border-b border-warmbeige-200">
      <h2 className="text-2xl md:text-3xl font-playfair text-darkgray-800">
        {loading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <>Welcome back, {displayName}!</>
        )}
      </h2>
      <p className="text-sm font-sourcesans text-darkgray-600 mt-1">
        Here's an overview of your breeding program
      </p>
    </div>
  );
};

export default WelcomeHeader;
