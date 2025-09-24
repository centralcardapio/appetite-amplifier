-- Allow first admin creation when no admin exists
CREATE POLICY "Allow first admin creation" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  role = 'admin'::app_role 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role
  )
  AND auth.uid() = user_id
);