-- Fix overly permissive UPDATE policy on complaints
DROP POLICY "Authenticated users can update complaints" ON public.complaints;

-- Only allow updates by assigned user, creator, or admins
CREATE POLICY "Users can update assigned or own complaints" ON public.complaints 
  FOR UPDATE TO authenticated 
  USING (
    auth.uid() = created_by 
    OR auth.uid() = assigned_to 
    OR public.has_role(auth.uid(), 'admin')
  );