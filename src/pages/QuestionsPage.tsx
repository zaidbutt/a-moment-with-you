import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  title: string;
  profiles: {
    name: string | null;
    last_name: string | null;
  };
  chapters: {
    title: string;
    stories: {
      title: string;
    };
  };
  answers: Array<{
    id: string;
    text: string;
  }>;
}

const QuestionsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      fetchQuestions(user.id);
    };
    checkAuth();
  }, []);

  const fetchQuestions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles!questions_user_id_fkey (
            name,
            last_name
          ),
          chapters!questions_chapter_id_fkey (
            title,
            stories!chapters_story_id_fkey (
              title
            )
          ),
          answers (
            id,
            text
          )
        `)
        .eq('to_user_id', userId);

      if (error) throw error;
      setQuestions(data || []);
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

  const handleAnswerSubmit = async (questionId: string) => {
    const text = answerText[questionId];
    if (!text?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an answer',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('answers')
        .insert({
          question_id: questionId,
          user_id: user.id,
          text,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Answer submitted successfully',
      });

      setAnswerText({ ...answerText, [questionId]: '' });
      
      // Refresh questions
      await fetchQuestions(user.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

  const unansweredQuestions = questions.filter(q => !q.answers || q.answers.length === 0);
  const answeredQuestions = questions.filter(q => q.answers && q.answers.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold">My Questions</h1>
          <p className="text-muted-foreground">Answer questions from your story members</p>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No questions yet. Join stories to start answering questions!
            </CardContent>
          </Card>
        ) : (
          <>
            {unansweredQuestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Unanswered Questions</h2>
                {unansweredQuestions.map((question: any) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        {question.title}
                      </CardTitle>
                      <CardDescription>
                        From {question.profiles?.name} {question.profiles?.last_name} •{' '}
                        {question.chapters?.stories?.title} - {question.chapters?.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Type your answer here..."
                        value={answerText[question.id] || ''}
                        onChange={(e) =>
                          setAnswerText({ ...answerText, [question.id]: e.target.value })
                        }
                        rows={4}
                      />
                      <Button onClick={() => handleAnswerSubmit(question.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Answer
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {answeredQuestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Answered Questions</h2>
                {answeredQuestions.map((question: any) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                        {question.title}
                      </CardTitle>
                      <CardDescription>
                        From {question.profiles?.name} {question.profiles?.last_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.answers.map((answer: any) => (
                        <div key={answer.id} className="p-4 bg-muted rounded-lg">
                          <p>{answer.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default QuestionsPage;
