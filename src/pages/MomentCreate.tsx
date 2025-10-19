import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';

const MomentCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const chapterId = searchParams.get('chapterId');
  const storyId = searchParams.get('storyId');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      }
    };
    checkAuth();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !chapterId) {
      toast({
        title: 'Error',
        description: 'Title and chapter are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get chapter and story info
      const { data: chapter } = await supabase
        .from('chapters')
        .select('story_id, order')
        .eq('id', chapterId)
        .single();

      if (!chapter) throw new Error('Chapter not found');

      // Get next moment order
      const { data: moments } = await supabase
        .from('moments')
        .select('order')
        .eq('chapter_id', chapterId)
        .order('order', { ascending: false })
        .limit(1);

      const nextOrder = moments && moments.length > 0 ? moments[0].order + 1 : 1;

      // Create media if file exists
      let mediaId = null;
      if (file) {
        const isVideo = file.type.startsWith('video/');
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .insert({
            is_video: isVideo,
            media_size_mega_bytes: file.size / 1048576,
            timestamp: Date.now(),
          })
          .select()
          .single();

        if (mediaError) throw mediaError;
        mediaId = mediaData.id;
      }

      // Create moment
      const { error: momentError } = await supabase
        .from('moments')
        .insert({
          title,
          description,
          order: nextOrder,
          user_id: user.id,
          chapter_id: chapterId,
          story_id: chapter.story_id,
          media_id: mediaId,
          timestamp: Date.now(),
        });

      if (momentError) throw momentError;

      toast({
        title: 'Success',
        description: 'Moment created successfully',
      });

      navigate(`/chapter/${chapterId}`);
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Moment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter moment title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this moment..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Media (Image or Video)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      {file?.type.startsWith('video/') ? (
                        <video src={previewUrl} controls className="max-h-64 mx-auto rounded-lg" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <label htmlFor="file" className="cursor-pointer">
                        <span className="text-primary hover:underline">Choose a file</span>
                        <input
                          id="file"
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Moment
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MomentCreate;
