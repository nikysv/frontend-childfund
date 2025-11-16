-- Create profiles table with user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER CHECK (age >= 16 AND age <= 24),
  city TEXT NOT NULL,
  business_sector TEXT NOT NULL,
  business_stage TEXT NOT NULL CHECK (business_stage IN ('idea', 'pre-incubacion', 'incubacion')),
  avatar_url TEXT,
  assigned_route TEXT CHECK (assigned_route IN ('pre', 'inc')),
  current_month INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create diagnostic questions table
CREATE TABLE public.diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('radio', 'slider')),
  options JSONB,
  weight INTEGER DEFAULT 1,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create diagnostic responses table
CREATE TABLE public.diagnostic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.diagnostic_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Create learning modules table
CREATE TABLE public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  route_type TEXT NOT NULL CHECK (route_type IN ('pre', 'inc')),
  month_number INTEGER NOT NULL,
  order_number INTEGER NOT NULL,
  video_url TEXT,
  content TEXT,
  exercises JSONB,
  quiz_questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user module progress table
CREATE TABLE public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Create soft skills modules table
CREATE TABLE public.soft_skills_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  exercise TEXT,
  quiz_questions JSONB,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user soft skills progress table
CREATE TABLE public.user_soft_skills_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.soft_skills_modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Create business transactions table (ERP)
CREATE TABLE public.business_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mentors table
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mentor assignments table
CREATE TABLE public.mentor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Create mentor sessions table
CREATE TABLE public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.mentor_assignments(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post comments table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points_required INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create courses library table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  content TEXT,
  downloadable BOOLEAN DEFAULT TRUE,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_soft_skills_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for diagnostic responses
CREATE POLICY "Users can view their own responses" ON public.diagnostic_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own responses" ON public.diagnostic_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own responses" ON public.diagnostic_responses FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user module progress
CREATE POLICY "Users can view their own progress" ON public.user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_module_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for soft skills progress
CREATE POLICY "Users can view their soft skills progress" ON public.user_soft_skills_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their soft skills progress" ON public.user_soft_skills_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their soft skills progress" ON public.user_soft_skills_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for business transactions
CREATE POLICY "Users can view their own transactions" ON public.business_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.business_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.business_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.business_transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mentor assignments
CREATE POLICY "Users can view their mentor assignments" ON public.mentor_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their mentor assignments" ON public.mentor_assignments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mentor sessions
CREATE POLICY "Users can view their sessions" ON public.mentor_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mentor_assignments WHERE id = assignment_id AND user_id = auth.uid())
);

-- RLS Policies for community posts
CREATE POLICY "Anyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user badges
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for course progress
CREATE POLICY "Users can view their course progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their course progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their course progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public read policies for reference tables
CREATE POLICY "Anyone can view diagnostic questions" ON public.diagnostic_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view learning modules" ON public.learning_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view soft skills modules" ON public.soft_skills_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, age, city, business_sector, business_stage)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
    COALESCE(NEW.raw_user_meta_data->>'city', 'La Paz'),
    COALESCE(NEW.raw_user_meta_data->>'business_sector', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'business_stage', 'idea')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();