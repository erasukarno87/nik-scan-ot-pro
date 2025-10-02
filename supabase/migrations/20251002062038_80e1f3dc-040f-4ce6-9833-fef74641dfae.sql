-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new restrictive policy that allows:
-- 1. Users to view their own profile only
-- 2. Admins to view all profiles
CREATE POLICY "Users can view own profile, admins view all"
ON public.profiles
FOR SELECT
USING (
  -- User can view their own profile
  (nik = current_setting('app.current_nik', true))
  OR
  -- Admins can view all profiles
  has_role(get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'::app_role)
);