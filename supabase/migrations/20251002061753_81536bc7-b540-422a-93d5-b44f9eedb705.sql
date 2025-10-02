-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'leader', 'manager');

-- Create user_roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents privilege escalation)
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

-- Create function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- Create function to get user_id from NIK
CREATE OR REPLACE FUNCTION public.get_user_id_from_nik(_nik TEXT)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE nik = _nik LIMIT 1
$$;

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.overtime_categories;
DROP POLICY IF EXISTS "Admins and managers can view all submissions" ON public.overtime_submissions;
DROP POLICY IF EXISTS "Approvers can update submissions" ON public.overtime_submissions;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update profiles" ON public.profiles;

-- Create new RLS policies for overtime_categories
CREATE POLICY "Only admins can manage categories"
ON public.overtime_categories
FOR ALL
TO authenticated
USING (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

-- Create new RLS policies for overtime_submissions
CREATE POLICY "Admins and managers can view all submissions"
ON public.overtime_submissions
FOR SELECT
TO authenticated
USING (public.has_any_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Approvers can update submissions v2"
ON public.overtime_submissions
FOR UPDATE
TO authenticated
USING (
  (approver1_nik = current_setting('app.current_nik', true)) OR
  (approver2_nik = current_setting('app.current_nik', true)) OR
  public.has_any_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), ARRAY['admin'::app_role, 'manager'::app_role])
);

-- Create new RLS policies for profiles
CREATE POLICY "Only admins can insert profiles v2"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

CREATE POLICY "Only admins can update profiles v2"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

-- RLS policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(public.get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'));