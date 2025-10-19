import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string | null;
  last_name: string | null;
  bio: string | null;
  fun_facts: string | null;
  image_url: string | null;
  sharing_moments: string | null;
}

interface Story {
  id: string;
  title: string;
  image_url: string | null;
}

interface Relationship {
  id: string;
  relation: string;
  profiles: {
    name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setIsOwnProfile(user.id === id);
      fetchProfileData();
    };
    checkAuth();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('story_users')
        .select(`
          stories:story_id (
            id,
            title,
            image_url
          )
        `)
        .eq('user_id', id);

      if (storiesError) throw storiesError;
      setStories(storiesData?.map((item: any) => item.stories).filter(Boolean) || []);

      // Fetch relationships - need to manually join since with_user isn't a FK
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('relationships')
        .select('*')
        .eq('user_id', id);

      if (relationshipsError) throw relationshipsError;

      // Manually fetch related profiles
      const enrichedRelationships = await Promise.all(
        (relationshipsData || []).map(async (rel) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, last_name, image_url')
            .eq('id', rel.with_user)
            .single();
          
          return {
            ...rel,
            profiles: profileData || { name: null, last_name: null, image_url: null },
          };
        })
      );

      setRelationships(enrichedRelationships);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.image_url || ''} />
                <AvatarFallback className="text-4xl">
                  {profile.name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {profile.name} {profile.last_name}
                  </h1>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-2">{profile.bio}</p>
                  )}
                </div>
                {isOwnProfile && (
                  <Button onClick={() => navigate(`/profile/${id}/edit`)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="stories" className="w-full">
          <TabsList>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-4">
            {stories.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No stories yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <Card
                    key={story.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/story/${story.id}`)}
                  >
                    {story.image_url ? (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center rounded-t-lg">
                        <BookOpen className="w-12 h-12 text-primary" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{story.title}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fun Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{profile.fun_facts || 'No fun facts added yet.'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sharing Moments</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{profile.sharing_moments || 'No sharing moments added yet.'}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            {relationships.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No relationships added yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {relationships.map((rel: any) => (
                  <Card key={rel.id}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={rel.profiles?.image_url || ''} />
                        <AvatarFallback>
                          <Heart className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {rel.profiles?.name} {rel.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{rel.relation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;
