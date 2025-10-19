-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_devices type
CREATE TYPE channel_type AS ENUM ('APNS', 'GCM');

-- Create app_role enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user', 'owner');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  last_name TEXT,
  fun_facts TEXT,
  bio TEXT,
  sharing_moments TEXT,
  image_url TEXT,
  is_account_protected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_devices table
CREATE TABLE public.user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  device_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  contact TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create relationships table
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  with_user UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  invite_code_for_owner TEXT UNIQUE,
  image_url TEXT,
  user_id UUID REFERENCES public.profiles(id),
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create story_users junction table
CREATE TABLE public.story_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Create story_owners junction table
CREATE TABLE public.story_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  "order" INT NOT NULL,
  image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create media table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id TEXT,
  timestamp BIGINT,
  image_url TEXT,
  video_url TEXT,
  media_size_mega_bytes FLOAT,
  is_video BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create moments table
CREATE TABLE public.moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  "order" INT NOT NULL,
  media_id UUID REFERENCES public.media(id),
  description TEXT,
  user_id UUID REFERENCES public.profiles(id),
  timestamp BIGINT,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  reported_count TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create moment_tagged_users junction table
CREATE TABLE public.moment_tagged_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, user_id)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  timestamp BIGINT,
  to_user_id UUID REFERENCES public.profiles(id),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.stories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id TEXT,
  user_id UUID REFERENCES public.profiles(id),
  timestamp BIGINT,
  element_id TEXT,
  type TEXT,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp BIGINT,
  message TEXT,
  title TEXT,
  story_id TEXT,
  story_name TEXT,
  invite_code TEXT,
  story_image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_story_joined BOOLEAN DEFAULT false,
  redirect_url TEXT,
  moment_id TEXT,
  from_user_id UUID REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shared_urls table
CREATE TABLE public.shared_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  is_ready BOOLEAN DEFAULT false,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  reported_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage_statistics table
CREATE TABLE public.storage_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  timestamp BIGINT,
  file_size TEXT,
  s3_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chapters_story_id ON public.chapters(story_id);
CREATE INDEX idx_chapters_order ON public.chapters("order");
CREATE INDEX idx_moments_chapter_id ON public.moments(chapter_id);
CREATE INDEX idx_moments_story_id ON public.moments(story_id);
CREATE INDEX idx_moments_order ON public.moments("order");
CREATE INDEX idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX idx_story_users_story_id ON public.story_users(story_id);
CREATE INDEX idx_story_users_user_id ON public.story_users(user_id);
CREATE INDEX idx_stories_invite_code ON public.stories(invite_code);
CREATE INDEX idx_stories_user_id ON public.stories(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_tagged_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_statistics ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check story membership
CREATE OR REPLACE FUNCTION public.is_story_member(_user_id UUID, _story_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.story_users
    WHERE user_id = _user_id AND story_id = _story_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for stories
CREATE POLICY "Users can view stories they're members of"
  ON public.stories FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.is_story_member(auth.uid(), id)
  );

CREATE POLICY "Users can create stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Story owners can update"
  ON public.stories FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.story_owners
      WHERE story_id = stories.id AND user_id = auth.uid()
    )
  );

-- RLS Policies for story_users
CREATE POLICY "Users can view story members"
  ON public.story_users FOR SELECT
  USING (public.is_story_member(auth.uid(), story_id));

CREATE POLICY "Story owners can manage members"
  ON public.story_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.story_owners
      WHERE story_id = story_users.story_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for chapters
CREATE POLICY "Users can view chapters in their stories"
  ON public.chapters FOR SELECT
  USING (public.is_story_member(auth.uid(), story_id));

CREATE POLICY "Users can create chapters in their stories"
  ON public.chapters FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    public.is_story_member(auth.uid(), story_id)
  );

CREATE POLICY "Users can update their chapters"
  ON public.chapters FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for moments
CREATE POLICY "Users can view moments in their stories"
  ON public.moments FOR SELECT
  USING (public.is_story_member(auth.uid(), story_id));

CREATE POLICY "Users can create moments in their stories"
  ON public.moments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    public.is_story_member(auth.uid(), story_id)
  );

CREATE POLICY "Users can update their moments"
  ON public.moments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their moments"
  ON public.moments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for questions
CREATE POLICY "Users can view questions in their stories"
  ON public.questions FOR SELECT
  USING (
    public.is_story_member(auth.uid(), story_id) OR
    auth.uid() = to_user_id
  );

CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for answers
CREATE POLICY "Users can view answers to questions they can see"
  ON public.answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = answers.question_id AND
      (public.is_story_member(auth.uid(), q.story_id) OR auth.uid() = q.to_user_id)
    )
  );

CREATE POLICY "Users can create answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for media
CREATE POLICY "Users can view media in their stories"
  ON public.media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.moments m
      WHERE m.media_id = media.id AND
      public.is_story_member(auth.uid(), m.story_id)
    )
  );

CREATE POLICY "Authenticated users can create media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = to_user_id);

CREATE POLICY "Users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = to_user_id);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view own emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emergency contacts"
  ON public.emergency_contacts FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for relationships
CREATE POLICY "Users can view own relationships"
  ON public.relationships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own relationships"
  ON public.relationships FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for user_devices
CREATE POLICY "Users can manage own devices"
  ON public.user_devices FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for storage_statistics
CREATE POLICY "Users can view own storage statistics"
  ON public.storage_statistics FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for shared_urls
CREATE POLICY "Users can view shared URLs"
  ON public.shared_urls FOR SELECT
  USING (
    (story_id IS NOT NULL AND public.is_story_member(auth.uid(), story_id)) OR
    auth.uid() = user_id
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moments_updated_at
  BEFORE UPDATE ON public.moments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();