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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Mail, Phone, MessageSquare, Calendar, Trash2, Eye, Search, X, Download } from 'lucide-react';
import { format, isAfter, isBefore, subDays, startOfDay } from 'date-fns';
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
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter submissions based on search and date
  const filteredSubmissions = submissions.filter(submission => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      submission.name.toLowerCase().includes(searchLower) ||
      submission.email.toLowerCase().includes(searchLower) ||
      submission.phone.includes(searchQuery) ||
      (submission.message?.toLowerCase().includes(searchLower) ?? false);

    // Date filter
    let matchesDate = true;
    const submissionDate = new Date(submission.created_at);
    const today = startOfDay(new Date());

    if (dateFilter === 'today') {
      matchesDate = isAfter(submissionDate, today);
    } else if (dateFilter === 'week') {
      matchesDate = isAfter(submissionDate, subDays(today, 7));
    } else if (dateFilter === 'month') {
      matchesDate = isAfter(submissionDate, subDays(today, 30));
    }

    return matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no submissions matching your current filters.',
        variant: 'destructive',
      });
      return;
    }

    // CSV headers
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Date'];
    
    // CSV rows
    const rows = filteredSubmissions.map(submission => [
      `"${submission.name.replace(/"/g, '""')}"`,
      `"${submission.email.replace(/"/g, '""')}"`,
      `"${submission.phone.replace(/"/g, '""')}"`,
      `"${(submission.message || '').replace(/"/g, '""')}"`,
      `"${format(new Date(submission.created_at), 'yyyy-MM-dd HH:mm:ss')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contact-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export complete',
      description: `Exported ${filteredSubmissions.length} submission${filteredSubmissions.length !== 1 ? 's' : ''} to CSV.`,
    });
  };

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
              {filteredSubmissions.length} of {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={filteredSubmissions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

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
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No submissions match your search criteria.
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
                    {filteredSubmissions.map((submission) => (
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
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
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
                          </div>
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

      {/* Message Details Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-foreground">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-foreground">
                    {format(new Date(selectedSubmission.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <a 
                  href={`mailto:${selectedSubmission.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {selectedSubmission.email}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <a 
                  href={`tel:${selectedSubmission.phone}`}
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Phone className="w-4 h-4" />
                  {selectedSubmission.phone}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedSubmission.message || 'No message provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
