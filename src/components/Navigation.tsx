import React from 'react';
import { BookOpen, Home, Plus, Settings, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navigation = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-card border-b border-border shadow-subtle sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-story-header">A Moment With</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search your stories, chapters, or moments..." 
                className="pl-10 bg-muted/50 border-border/50 focus:bg-card transition-gentle"
              />
            </div>
          </div>

          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hover:bg-primary-soft transition-gentle" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button size="sm" className="shadow-subtle" onClick={() => navigate('/create')}>
              <Plus className="h-4 w-4 mr-2" />
              New Story
            </Button>
            
            <Button variant="ghost" size="sm" className="hover:bg-muted transition-gentle">
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="hover:bg-muted transition-gentle">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;