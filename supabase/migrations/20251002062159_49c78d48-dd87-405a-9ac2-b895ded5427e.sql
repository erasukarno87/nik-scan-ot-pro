-- Drop the insecure policy that allows anyone to insert
DROP POLICY IF EXISTS "Approvers can insert approval history" ON public.approval_history;

-- Create a secure policy that only allows:
-- 1. The actual assigned approvers to insert records for their assigned overtime
-- 2. The approver_nik in the record must match the current user's NIK
-- 3. Admins can insert approval records
CREATE POLICY "Only assigned approvers can insert approval records"
ON public.approval_history
FOR INSERT
WITH CHECK (
  -- The approver_nik in the new record must match the current user
  approver_nik = current_setting('app.current_nik', true)
  AND
  (
    -- User must be an assigned approver for this overtime submission
    EXISTS (
      SELECT 1
      FROM public.overtime_submissions os
      WHERE os.id = approval_history.overtime_id
      AND (
        os.approver1_nik = current_setting('app.current_nik', true)
        OR
        os.approver2_nik = current_setting('app.current_nik', true)
      )
    )
    OR
    -- Admins can insert approval records
    has_role(get_user_id_from_nik(current_setting('app.current_nik', true)), 'admin'::app_role)
  )
);