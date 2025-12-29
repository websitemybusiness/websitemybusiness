-- Allow admins to delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));