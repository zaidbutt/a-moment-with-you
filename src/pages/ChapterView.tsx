import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Video, Plus, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: string;
  title: string;
  order: number;
  image_url: string | null;
  story_id: string;
}

interface Moment {
  id: string;
  title: string;
  description: string | null;
  order: number;
  media: {
    image_url: string | null;
    video_url: string | null;
    is_video: boolean;
  } | null;
}

interface Question {
  id: string;
  title: string;
  profiles: {
    name: string | null;
    last_name: string | null;
  };
  answers: Array<{
    text: string;
    user_id: string;
  }>;
}

const ChapterView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      fetchChapterDetails();
    };
    checkAuth();
  }, [id]);

  const fetchChapterDetails = async () => {
    try {
      // Fetch chapter
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // Fetch moments
      const { data: momentsData, error: momentsError } = await supabase
        .from('moments')
        .select(`
          *,
          media:media_id (
            image_url,
            video_url,
            is_video
          )
        `)
        .eq('chapter_id', id)
        .order('order', { ascending: true });

      if (momentsError) throw momentsError;
      setMoments(momentsData || []);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          profiles!questions_user_id_fkey (
            name,
            last_name
          ),
          answers (
            text,
            user_id
          )
        `)
        .eq('chapter_id', id);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
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

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">Chapter not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate(`/story/${chapter.story_id}`)}>
              ← Back to Story
            </Button>
            <h1 className="text-4xl font-bold mt-4">{chapter.title}</h1>
            <p className="text-muted-foreground">Chapter {chapter.order}</p>
          </div>
          <Button onClick={() => navigate(`/moment/create?chapterId=${id}`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Moment
          </Button>
        </div>

        <Tabs defaultValue="moments" className="w-full">
          <TabsList>
            <TabsTrigger value="moments">Moments</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="moments" className="space-y-4">
            {moments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No moments yet. Create your first moment to capture memories.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {moments.map((moment) => (
                  <Card
                    key={moment.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/moment/${moment.id}`)}
                  >
                    {moment.media && (
                      <div className="relative w-full h-48">
                        {moment.media.is_video ? (
                          <video
                            src={moment.media.video_url || ''}
                            className="w-full h-full object-cover rounded-t-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={moment.media.image_url || ''}
                            alt={moment.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                          {moment.media.is_video ? (
                            <Video className="w-4 h-4 text-white" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{moment.title}</CardTitle>
                      {moment.description && (
                        <CardDescription className="line-clamp-2">
                          {moment.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No questions yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question: any) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        {question.title}
                      </CardTitle>
                      <CardDescription>
                        Asked by {question.profiles?.name} {question.profiles?.last_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.answers && question.answers.length > 0 ? (
                        <div className="space-y-2">
                          {question.answers.map((answer: any, idx: number) => (
                            <div key={idx} className="p-3 bg-muted rounded-lg">
                              <p>{answer.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Button onClick={() => navigate(`/question/${question.id}/answer`)}>
                          Answer Question
                        </Button>
                      )}
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

export default ChapterView;
