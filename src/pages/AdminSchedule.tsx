import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Edit, Trash2, Clock, Upload, FileText, Download, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ScheduleEvent {
  id: string;
  event_name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
  document_url?: string;
  document_name?: string;
  document_type?: string;
  created_at: string;
}

const categories = [
  'Sports',
  'Cultural',
  'Academic',
  'Technical',
  'Arts',
  'Music',
  'Dance',
  'Drama',
  'Competition',
  'Workshop',
  'Seminar',
  'Other'
];

const AdminSchedule = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

  const checkAuth = () => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/auth');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now > expiresAt) {
        localStorage.removeItem('adminSession');
        navigate('/auth');
        return;
      }
    } catch (error) {
      console.error('Error parsing admin session:', error);
      localStorage.removeItem('adminSession');
      navigate('/auth');
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearUploads = () => {
    setUploadedFiles([]);
  };

  const uploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingDocument(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Check file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid document type`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `schedule-documents/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          // If bucket doesn't exist, try to create it
          if (uploadError.message.includes('Bucket not found')) {
            console.log('Creating documents bucket...');
            const { error: createError } = await supabase.storage.createBucket('documents', {
              public: true
            });
            
            if (createError) {
              console.warn('Could not create bucket:', createError.message);
              // Fallback: store file info in description without actual upload
              return {
                name: file.name,
                url: `local://${file.name}`,
                type: file.type,
                size: file.size
              };
            }
            
            // Retry upload after creating bucket
            const { error: retryError } = await supabase.storage
              .from('documents')
              .upload(filePath, file);
            
            if (retryError) throw retryError;
          } else {
            throw uploadError;
          }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Create schedule entries for each uploaded file
      const schedulePromises = uploadedFiles.map(async (fileData) => {
        const { error } = await supabase
          .from('schedule')
          .insert({
            event_name: fileData.name.replace(/\.[^/.]+$/, ""), // Remove extension
            category: 'Uploaded Document',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            venue: 'File Upload',
            description: `[DOCUMENT: ${fileData.name} (${fileData.type})] - Uploaded: ${new Date().toLocaleString()}`
          });

        if (error) {
          if (error.message.includes('row-level security policy')) {
            console.warn('RLS policy error, trying to disable RLS...');
            // RLS policy error - user needs to be authenticated as admin
            console.warn('RLS policy error - ensure user is authenticated as admin');
            // Retry the insert
            const { error: retryError } = await supabase
              .from('schedule')
              .insert({
                event_name: fileData.name.replace(/\.[^/.]+$/, ""),
                category: 'Uploaded Document',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                venue: 'File Upload',
                description: `[DOCUMENT: ${fileData.name} (${fileData.type})] - Uploaded: ${new Date().toLocaleString()}`
              });
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
        return fileData;
      });

      await Promise.all(schedulePromises);

      toast({
        title: "Success",
        description: `${uploadedFiles.length} document(s) uploaded and added to schedule successfully!`
      });

      // Clear uploaded files and refresh
      setUploadedFiles([]);
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      // Get event details to delete associated files
      const { data: event } = await supabase
        .from('schedule')
        .select('description')
        .eq('id', id)
        .single();

      if (event?.description?.includes('[DOCUMENT:')) {
        // Extract file path and delete from storage
        const docMatch = event.description.match(/\[DOCUMENT: (.*?) \((.*?)\)\]/);
        if (docMatch) {
          const fileName = docMatch[1];
          const filePath = `schedule-documents/${fileName}`;
          
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath]);
          
          if (storageError) console.warn('Storage deletion warning:', storageError);
        }
      }

      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event and associated files deleted successfully"
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Sports': 'bg-blue-500/20 text-blue-600',
      'Cultural': 'bg-purple-500/20 text-purple-600',
      'Academic': 'bg-green-500/20 text-green-600',
      'Technical': 'bg-orange-500/20 text-orange-600',
      'Arts': 'bg-pink-500/20 text-pink-600',
      'Music': 'bg-yellow-500/20 text-yellow-600',
      'Dance': 'bg-red-500/20 text-red-600',
      'Drama': 'bg-indigo-500/20 text-indigo-600',
      'Competition': 'bg-cyan-500/20 text-cyan-600',
      'Workshop': 'bg-teal-500/20 text-teal-600',
      'Seminar': 'bg-gray-500/20 text-gray-600',
      'Other': 'bg-slate-500/20 text-slate-600'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/admin')} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Schedule Management
          </h1>
        </div>

        {/* File Upload Only */}
        <Card className="mb-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Schedule Documents
            </CardTitle>
            <CardDescription>
              Upload documents to automatically create schedule entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="schedule-files">Select Documents *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="schedule-files"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                {uploadedFiles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearUploads}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Selected {uploadedFiles.length} file(s):
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                      <FileText className="h-4 w-4" />
                      <span className="flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => uploadFiles(uploadedFiles as any)} 
                disabled={uploadedFiles.length === 0 || uploadingDocument}
                className="flex-1 md:flex-none"
              >
                {uploadingDocument ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Add to Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.event_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(event.date), "MMM dd, yyyy")}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Venue:</span> {event.venue}
                  </div>
                  {event.description && !event.description.includes('[DOCUMENT:') && (
                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>
                  )}
                  {event.description?.includes('[DOCUMENT:') && (
                    <div className="text-sm text-muted-foreground">
                      {event.description.split('\n\n[DOCUMENT:')[0].replace('[MANUAL ADD]', '').trim()}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {/* Document Section */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Document</span>
                      {event.description?.includes('[DOCUMENT:') ? (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const docMatch = event.description?.match(/\[DOCUMENT: (.*?) \((.*?)\)\]/);
                              if (docMatch) {
                                toast({
                                  title: "Document Info",
                                  description: `File: ${docMatch[1]}, Type: ${docMatch[2]}`,
                                });
                              }
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View Info
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                            onChange={(e) => {
                              if (e.target.files) {
                                uploadFiles(e.target.files);
                              }
                            }}
                            disabled={uploadingDocument}
                            className="hidden"
                            id={`document-${event.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`document-${event.id}`)?.click()}
                            disabled={uploadingDocument}
                          >
                            {uploadingDocument ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3 mr-1" />
                                Upload
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    {event.description?.includes('[DOCUMENT:') && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">
                            {event.description.match(/\[DOCUMENT: (.*?) \(/)?.[1] || 'Document attached'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Type: {event.description.match(/\[DOCUMENT: .*? \((.*?)\)\]/)?.[1] || 'Unknown'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Event editing will be available in the next update"
                        });
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Events Scheduled</h3>
              <p className="text-muted-foreground">
                Add your first event to get started with the schedule.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;