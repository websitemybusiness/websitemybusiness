import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Mail, Phone, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load submissions');
        console.error('Error fetching submissions:', error);
      } else {
        setSubmissions(data || []);
      }
      setLoadingData(false);
    };

    if (isAdmin && !adminLoading) {
      fetchSubmissions();
    }
  }, [isAdmin, adminLoading]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Delete failed',
        description: 'Could not delete the submission. Please try again.',
        variant: 'destructive',
      });
    } else {
      setSubmissions(submissions.filter(s => s.id !== id));
      toast({
        title: 'Deleted',
        description: 'Submission has been removed.',
      });
    }
    setDeletingId(null);
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage contact submissions</p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {user.email}
          </Badge>
        </div>
      </header>

      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Contact Form Submissions
            </CardTitle>
            <CardDescription>
              {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No submissions yet. Contact form submissions will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <a 
                              href={`mailto:${submission.email}`}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Mail className="w-3 h-3" />
                              {submission.email}
                            </a>
                            <a 
                              href={`tel:${submission.phone}`}
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                              <Phone className="w-3 h-3" />
                              {submission.phone}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs">
                          <p className="truncate text-sm text-muted-foreground">
                            {submission.message || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(submission.created_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingId === submission.id}
                              >
                                {deletingId === submission.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the contact submission from {submission.name}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(submission.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
