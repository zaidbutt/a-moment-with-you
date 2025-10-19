import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  title: string;
  image_url: string | null;
  invite_code: string;
  locked: boolean;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  image_url: string | null;
}

interface StoryUser {
  id: string;
  profiles: {
    name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [members, setMembers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      fetchStoryDetails();
    };
    checkAuth();
  }, [id]);

  const fetchStoryDetails = async () => {
    try {
      // Fetch story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();

      if (storyError) throw storyError;
      setStory(storyData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', id)
        .order('order', { ascending: true });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('story_users')
        .select(`
          id,
          profiles:user_id (
            name,
            last_name,
            image_url
          )
        `)
        .eq('story_id', id);

      if (membersError) throw membersError;
      setMembers(membersData || []);
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

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">Story not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 space-y-6">
        <div className="relative h-64 rounded-lg overflow-hidden">
          {story.image_url ? (
            <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-primary" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-4xl font-bold text-white mb-2">{story.title}</h1>
            <p className="text-white/80">Invite Code: {story.invite_code}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate(`/story/${id}/manage`)}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Story
          </Button>
          <Button onClick={() => navigate(`/chapter/create?storyId=${id}`)}>
            Add Chapter
          </Button>
        </div>

        <Tabs defaultValue="chapters" className="w-full">
          <TabsList>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="space-y-4">
            {chapters.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No chapters yet. Create your first chapter to start building your story.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {chapters.map((chapter) => (
                  <Card
                    key={chapter.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/chapter/${chapter.id}`)}
                  >
                    {chapter.image_url && (
                      <img
                        src={chapter.image_url}
                        alt={chapter.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader>
                      <CardTitle>{chapter.title}</CardTitle>
                      <CardDescription>Chapter {chapter.order}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member: any) => (
                <Card key={member.id}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.profiles?.image_url ? (
                        <img
                          src={member.profiles.image_url}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {member.profiles?.name} {member.profiles?.last_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StoryDetail;
