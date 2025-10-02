-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Everyone can view approval history" ON public.approval_history;

-- Create a secure policy that allows viewing approval history only to:
-- 1. The employee who submitted the overtime request
-- 2. The approvers involved in that request
-- 3. Admins
CREATE POLICY "Restricted approval history access"
ON public.approval_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.overtime_submissions os
    WHERE os.id = approval_history.overtime_id
    AND (
      -- Employee who submitted the overtime
      os.employee_nik = current_setting('app.current_nik', true)
      OR
      -- Approver 1 or Approver 2 of the overtime
      os.approver1_nik = current_setting('app.current_nik', true)
      OR
      os.approver2_nik = current_setting('app.current_nik', true)
      OR
      -- Admins can view all approval history
      has_role(get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'::app_role)
    )
  )
);