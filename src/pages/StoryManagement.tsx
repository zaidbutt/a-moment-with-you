import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Link2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  title: string;
  invite_code: string;
  invite_code_for_owner: string | null;
  locked: boolean;
}

interface Member {
  id: string;
  role: string;
  profiles: {
    id: string;
    name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

const StoryManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [title, setTitle] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      await fetchStoryData(user.id);
    };
    checkAuth();
  }, [id]);

  const fetchStoryData = async (userId: string) => {
    try {
      // Check if user is owner
      const { data: ownerData } = await supabase
        .from('story_owners')
        .select('id')
        .eq('story_id', id)
        .eq('user_id', userId)
        .single();

      setIsOwner(!!ownerData);

      if (!ownerData) {
        toast({
          title: 'Access Denied',
          description: 'Only story owners can manage the story',
          variant: 'destructive',
        });
        navigate(`/story/${id}`);
        return;
      }

      // Fetch story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();

      if (storyError) throw storyError;
      setStory(storyData);
      setTitle(storyData.title);
      setLocked(storyData.locked);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('story_users')
        .select(`
          id,
          role,
          profiles:user_id (
            id,
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

  const handleUpdateStory = async () => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ title, locked })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('story_users')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });

      setMembers(members.filter(m => m.id !== memberId));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied',
      description: 'Invite code copied to clipboard',
    });
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
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate(`/story/${id}`)}>
              ← Back to Story
            </Button>
            <h1 className="text-4xl font-bold mt-4">Story Management</h1>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invites">Invite Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Story Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Story Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lock Story</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent new members from joining
                    </p>
                  </div>
                  <Switch checked={locked} onCheckedChange={setLocked} />
                </div>

                <Button onClick={handleUpdateStory}>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member: any) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Member Invite Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={story.invite_code} readOnly />
                  <Button onClick={() => copyInviteCode(story.invite_code)}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this code with others to invite them as members
                </p>
              </CardContent>
            </Card>

            {story.invite_code_for_owner && (
              <Card>
                <CardHeader>
                  <CardTitle>Owner Invite Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input value={story.invite_code_for_owner} readOnly />
                    <Button onClick={() => copyInviteCode(story.invite_code_for_owner!)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share this code to grant owner privileges
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StoryManagement;
