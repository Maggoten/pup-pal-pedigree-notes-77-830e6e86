
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDogs } from '@/context/DogsContext';
import DogList from '@/components/DogList';

const MyDogs: React.FC = () => {
  const { dogs } = useDogs();
  
  const females = dogs.filter(dog => dog.gender === 'female');
  const males = dogs.filter(dog => dog.gender === 'male');

  return (
    <PageLayout 
      title="My Dogs" 
      description="Manage your breeding dogs"
    >
      <Tabs defaultValue="bitches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bitches">Bitches</TabsTrigger>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bitches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bitches</CardTitle>
              <CardDescription>
                Female dogs in your breeding program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DogList dogs={females} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dogs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dogs</CardTitle>
              <CardDescription>
                Male dogs in your breeding program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DogList dogs={males} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default MyDogs;
