-- Drop and recreate the INSERT policy to ensure anonymous users can submit
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);