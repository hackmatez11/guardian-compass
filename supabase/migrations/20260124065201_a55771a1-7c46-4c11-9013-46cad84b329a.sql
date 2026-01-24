-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'counselor', 'student');

-- Create risk level enum
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');

-- Create user roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    student_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    gpa DECIMAL(3,2) DEFAULT 0,
    risk_level risk_level DEFAULT 'low',
    risk_score DECIMAL(5,2) DEFAULT 0,
    assigned_counselor_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create counseling sessions table
CREATE TABLE public.counseling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on counseling_sessions
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;

-- Create psychological surveys table
CREATE TABLE public.psychological_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 10),
    social_support INTEGER CHECK (social_support >= 1 AND social_support <= 10),
    academic_confidence INTEGER CHECK (academic_confidence >= 1 AND academic_confidence <= 10),
    financial_concerns INTEGER CHECK (financial_concerns >= 1 AND financial_concerns <= 10),
    additional_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on psychological_surveys
ALTER TABLE public.psychological_surveys ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create academic_records table for trend tracking
CREATE TABLE public.academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    semester INTEGER NOT NULL,
    year INTEGER NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on academic_records
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and Counselors can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'counselor'));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for students
CREATE POLICY "Students can view their own record"
ON public.students FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all students"
ON public.students FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Counselors can view assigned students"
ON public.students FOR SELECT
USING (public.has_role(auth.uid(), 'counselor'));

CREATE POLICY "Admins can insert students"
ON public.students FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update students"
ON public.students FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Counselors can update assigned students"
ON public.students FOR UPDATE
USING (public.has_role(auth.uid(), 'counselor') AND assigned_counselor_id = auth.uid());

-- RLS Policies for counseling_sessions
CREATE POLICY "Students can view their own sessions"
ON public.counseling_sessions FOR SELECT
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Counselors can view their sessions"
ON public.counseling_sessions FOR SELECT
USING (counselor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Counselors can insert sessions"
ON public.counseling_sessions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'counselor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Counselors can update their sessions"
ON public.counseling_sessions FOR UPDATE
USING (counselor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for psychological_surveys
CREATE POLICY "Students can view their own surveys"
ON public.psychological_surveys FOR SELECT
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Counselors and Admins can view all surveys"
ON public.psychological_surveys FOR SELECT
USING (public.has_role(auth.uid(), 'counselor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can insert their own surveys"
ON public.psychological_surveys FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and Counselors can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'counselor'));

-- RLS Policies for academic_records
CREATE POLICY "Students can view their own records"
ON public.academic_records FOR SELECT
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Admins and Counselors can view all records"
ON public.academic_records FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'counselor'));

CREATE POLICY "Admins can insert records"
ON public.academic_records FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counseling_sessions_updated_at
BEFORE UPDATE ON public.counseling_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();