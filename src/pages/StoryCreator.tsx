import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Upload, Type, Image, Mic, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StoryCreator = () => {
  const navigate = useNavigate();
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [chapters, setChapters] = useState<Array<{ id: string; title: string; content: string }>>([
    { id: '1', title: 'Chapter 1', content: '' }
  ]);

  const addChapter = () => {
    const newChapter = {
      id: Date.now().toString(),
      title: `Chapter ${chapters.length + 1}`,
      content: ''
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (id: string, field: string, value: string) => {
    setChapters(chapters.map(chapter => 
      chapter.id === id ? { ...chapter, [field]: value } : chapter
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hover:bg-muted transition-gentle" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold text-story-header">Create New Story</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="hover:bg-primary-soft transition-gentle">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button className="shadow-story">
                <Plus className="h-4 w-4 mr-2" />
                Publish Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story Header */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Story Title
                  </label>
                  <Input
                    placeholder="Give your story a meaningful title..."
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="text-xl font-semibold border-border/50 focus:border-primary transition-gentle"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Story Description
                  </label>
                  <Textarea
                    placeholder="Describe what this story is about and why it's important to you..."
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    className="resize-none border-border/50 focus:border-primary transition-gentle"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Chapters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-story-header">Chapters</h3>
                <Button onClick={addChapter} variant="outline" size="sm" className="hover:bg-primary-soft transition-gentle">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
              </div>

              {chapters.map((chapter, index) => (
                <Card key={chapter.id} className="p-6 bg-card border-0 shadow-card">
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder={`Chapter ${index + 1} title...`}
                        value={chapter.title}
                        onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                        className="font-semibold text-lg border-border/50 focus:border-primary transition-gentle"
                      />
                    </div>
                    
                    <Tabs defaultValue="write" className="w-full">
                      <TabsList className="bg-muted/50">
                        <TabsTrigger value="write" className="data-[state=active]:bg-primary-soft">
                          <Type className="h-4 w-4 mr-2" />
                          Write
                        </TabsTrigger>
                        <TabsTrigger value="media" className="data-[state=active]:bg-primary-soft">
                          <Image className="h-4 w-4 mr-2" />
                          Media
                        </TabsTrigger>
                        <TabsTrigger value="voice" className="data-[state=active]:bg-primary-soft">
                          <Mic className="h-4 w-4 mr-2" />
                          Voice
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="write" className="mt-4">
                        <Textarea
                          placeholder="Start writing your chapter... Share the details, emotions, and moments that make this part of your story special."
                          value={chapter.content}
                          onChange={(e) => updateChapter(chapter.id, 'content', e.target.value)}
                          className="min-h-[200px] resize-y border-border/50 focus:border-primary transition-gentle"
                        />
                      </TabsContent>
                      
                      <TabsContent value="media" className="mt-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-gentle">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-2">Upload photos, videos, or documents</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop files here, or click to browse
                          </p>
                          <Button variant="outline" className="hover:bg-primary-soft transition-gentle">
                            Choose Files
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="voice" className="mt-4">
                        <div className="bg-gradient-moment rounded-lg p-6 text-center">
                          <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
                          <p className="text-story-header font-medium mb-2">Record Your Voice</p>
                          <p className="text-muted-foreground mb-4">
                            Add a personal touch with voice recordings of your memories
                          </p>
                          <Button className="shadow-story">
                            <Mic className="h-4 w-4 mr-2" />
                            Start Recording
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Settings */}
            <Card className="p-6 bg-gradient-chapter border-0 shadow-card">
              <h4 className="font-semibold text-story-header mb-4">Story Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Privacy
                  </label>
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary transition-gentle">
                    <option>Private</option>
                    <option>Family Only</option>
                    <option>Public</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Collaborators
                  </label>
                  <Input placeholder="Invite family members..." className="border-border/50 focus:border-primary transition-gentle" />
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h4 className="font-semibold text-story-header mb-4">Storytelling Tips</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>✨ Start with the emotions and feelings</p>
                <p>📸 Add photos to bring memories to life</p>
                <p>🎵 Include voice recordings for authenticity</p>
                <p>📝 Write as if telling a friend</p>
                <p>⏱️ Take your time - stories improve with reflection</p>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h4 className="font-semibold text-story-header mb-4">Recent Activity</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Auto-saved</span>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chapter 1 updated</span>
                  <span className="text-xs text-muted-foreground">5 min ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;