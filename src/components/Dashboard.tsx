import React from 'react';
import { Plus, BookOpen, ChevronRight, Heart, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import heroImage from '@/assets/hero-storytelling.jpg';

interface Story {
  id: string;
  title: string;
  description: string;
  chapters: number;
  moments: number;
  lastUpdated: string;
  collaborators?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  // Sample data - in real app this would come from your backend
  // Changing Color Schemes
  const recentStories: Story[ ] = [
    {
      id: '1',
      title: 'Growing Up in Nashville',
      description: 'Childhood memories of music and family traditions',
      chapters: 8,
      moments: 24,
      lastUpdated: '2 days ago',
      collaborators: 3
    },
    {
      id: '2', 
      title: 'Our Wedding Journey',
      description: 'From first date to walking down the aisle',
      chapters: 5,
      moments: 18,
      lastUpdated: '1 week ago',
      collaborators: 2
    },
    {
      id: '3',
      title: 'Grandma\'s Recipes',
      description: 'Family cooking traditions passed down through generations',
      chapters: 12,
      moments: 35,
      lastUpdated: '3 days ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
          <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
            <div className="max-w-4xl animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
                A Moment With
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
                Capture, preserve, and share your most meaningful stories across chapters and moments
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 shadow-story hover:shadow-xl transition-story"
                onClick={() => navigate('/create')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Your First Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-chapter border-0 shadow-card hover:shadow-story transition-story">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stories</p>
                <p className="text-3xl font-bold text-story-header">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-moment border-0 shadow-card hover:shadow-story transition-story">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Moments</p>
                <p className="text-3xl font-bold text-story-header">147</p>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-0 shadow-card hover:shadow-story transition-story">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collaborators</p>
                <p className="text-3xl font-bold text-story-header">8</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Recent Stories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-story-header">Recent Stories</h2>
            <Button variant="outline" className="hover:bg-primary-soft transition-gentle">
              View All Stories
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentStories.map((story) => (
              <Card 
                key={story.id} 
                className="p-6 bg-card border-0 shadow-card hover:shadow-story transition-story cursor-pointer group"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-story-header group-hover:text-primary transition-gentle">
                      {story.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>{story.chapters} chapters</span>
                      <span>{story.moments} moments</span>
                    </div>
                    {story.collaborators && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{story.collaborators}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Updated {story.lastUpdated}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 bg-gradient-chapter border-0 shadow-card">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-story-header">Ready to create something beautiful?</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether it's a family memory, a personal journey, or a shared adventure, 
              every story deserves to be told with care and preserved with love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-story" onClick={() => navigate('/create')}>
                <Plus className="mr-2 h-5 w-5" />
                New Story
              </Button>
              <Button size="lg" variant="outline" className="hover:bg-primary-soft transition-gentle">
                Import from Mobile App
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;