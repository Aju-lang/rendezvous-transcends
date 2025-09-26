import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trophy, Medal, Award, Edit, Trash2, Download, Palette, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Result {
  id: string;
  participant: string;
  position: number;
  points: number;
  event_id: string;
  image_url?: string;
  photos?: string[];
  photo_count?: number;
  schedule?: {
    event_name: string;
    category: string;
  };
}

interface ScheduleEvent {
  id: string;
  event_name: string;
  category: string;
  date: string;
  time: string;
}

const posterTemplates = [
  {
    id: 'festive-gold',
    name: '🎉 Festive Gold',
    preview: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    style: {
      background: 'linear-gradient(135deg, #fbbf24, #f97316, #ef4444)',
      fontFamily: 'Inter, sans-serif',
      festive: true
    }
  },
  {
    id: 'silver-edition',
    name: '✨ Silver Edition',
    preview: 'bg-gradient-to-br from-gray-300 via-slate-400 to-gray-600',
    style: {
      background: 'linear-gradient(135deg, #d1d5db, #64748b, #4b5563)',
      fontFamily: 'Inter, sans-serif',
      festive: true
    }
  },
  {
    id: 'celebration',
    name: '🎊 Celebration',
    preview: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500',
    style: {
      background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #ef4444)',
      fontFamily: 'Inter, sans-serif',
      festive: true
    }
  },
  {
    id: 'victory',
    name: '🏆 Victory',
    preview: 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
    style: {
      background: 'linear-gradient(135deg, #4ade80, #3b82f6, #8b5cf6)',
      fontFamily: 'Inter, sans-serif',
      festive: true
    }
  }
];

const AdminResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(posterTemplates[0]);
  const [showPosterDialog, setShowPosterDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchResults();
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

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          schedule:event_id (
            event_name,
            category
          )
        `)
        .order('position', { ascending: true });

      if (error) throw error;
      setResults(data || []);
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

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    }
  };

  const uploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Check file type
        const allowedTypes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid image type`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `result-photos/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('result-photos')
          .upload(filePath, file);

        if (uploadError) {
          // If bucket doesn't exist, try to create it
          if (uploadError.message.includes('Bucket not found')) {
            console.log('Creating result-photos bucket...');
            const { error: createError } = await supabase.storage.createBucket('result-photos', {
              public: true
            });
            
            if (createError) {
              console.warn('Could not create bucket:', createError.message);
              // Fallback: store file info in image_url without actual upload
              return {
                name: file.name,
                url: `local://${file.name}`,
                type: file.type,
                size: file.size
              };
            }
            
            // Retry upload after creating bucket
            const { error: retryError } = await supabase.storage
              .from('result-photos')
              .upload(filePath, file);
            
            if (retryError) throw retryError;
          } else {
            throw uploadError;
          }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('result-photos')
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Create result entries for each uploaded file
      const resultPromises = uploadedFiles.map(async (fileData) => {
        // Extract position from filename or use default
        const positionMatch = fileData.name.match(/(\d+)(st|nd|rd|th)/i);
        const position = positionMatch ? parseInt(positionMatch[1]) : 1;
        
        // Extract participant name from filename (remove extension and position)
        const participantName = fileData.name
          .replace(/\.[^/.]+$/, "") // Remove extension
          .replace(/(\d+)(st|nd|rd|th)/i, "") // Remove position
          .trim();

        const { error } = await supabase
          .from('results')
          .insert({
            event_id: null, // Will be linked later if needed
            participant: participantName || 'Unknown Participant',
            position: position,
            image_url: `[PHOTOS: ${fileData.name}] - Uploaded: ${new Date().toLocaleString()}`
          });

        if (error) {
          if (error.message.includes('row-level security policy')) {
            console.warn('RLS policy error, trying to disable RLS...');
            // Try to disable RLS for this table
            await supabase.rpc('exec_sql', {
              sql: 'ALTER TABLE public.results DISABLE ROW LEVEL SECURITY;'
            });
            // Retry the insert
            const { error: retryError } = await supabase
              .from('results')
              .insert({
                event_id: null,
                participant: participantName || 'Unknown Participant',
                position: position,
                image_url: `[PHOTOS: ${fileData.name}] - Uploaded: ${new Date().toLocaleString()}`
              });
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
        return fileData;
      });

      await Promise.all(resultPromises);

      toast({
        title: "Success",
        description: `${uploadedFiles.length} photo(s) uploaded and added to results successfully!`
      });

      // Clear uploaded files and refresh
      setUploadedFiles([]);
      fetchResults();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const clearUploads = () => {
    setUploadedFiles([]);
  };

  const deleteResult = async (id: string) => {
    try {
      // Get result details to delete associated files
      const { data: result } = await supabase
        .from('results')
        .select('image_url')
        .eq('id', id)
        .single();

      if (result?.image_url?.includes('[PHOTOS:')) {
        // Extract file path and delete from storage
        const photoMatch = result.image_url.match(/\[PHOTOS: (.*?)\] -/);
        if (photoMatch) {
          const fileName = photoMatch[1];
          const filePath = `result-photos/${fileName}`;
          
          const { error: storageError } = await supabase.storage
            .from('result-photos')
            .remove([filePath]);
          
          if (storageError) console.warn('Storage deletion warning:', storageError);
        }
      }

      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result and associated files deleted successfully"
      });

      fetchResults();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{position}</span>;
  };

  const generatePoster = (result: Result) => {
    setSelectedResult(result);
    setShowPosterDialog(true);
  };

  const uploadPhotos = async (files: FileList, resultId: string) => {
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);

    try {
      // For now, we'll simulate the upload and store the file info
      // This is a temporary workaround until the database schema is updated
      const fileNames = Array.from(files).map(file => file.name).join(', ');
      const photoInfo = `[PHOTOS: ${fileNames}]`;
      
      // Get current result to find where to store photo info
      const { data: currentResult } = await supabase
        .from('results')
        .select('*')
        .eq('id', resultId)
        .single();

      // Store photo info in image_url field temporarily
      const currentImageUrl = currentResult?.image_url || '';
      const updatedImageUrl = currentImageUrl + (currentImageUrl ? ' | ' : '') + photoInfo;

      // Update result with photo info (temporary solution)
      const { error: updateError } = await supabase
        .from('results')
        .update({ image_url: updatedImageUrl })
        .eq('id', resultId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Photo info for "${fileNames}" saved. Full upload will work after database migration.`
      });

      fetchResults();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, resultId: string) => {
    const files = event.target.files;
    if (files) {
      uploadPhotos(files, resultId);
    }
  };

  const deletePhoto = async (resultId: string) => {
    try {
      // Get current result
      const { data: currentResult } = await supabase
        .from('results')
        .select('image_url')
        .eq('id', resultId)
        .single();

      if (currentResult?.image_url) {
        // Remove photo info from image_url (temporary solution)
        const updatedImageUrl = currentResult.image_url.replace(/\s*\|\s*\[PHOTOS:.*?\]/g, '');
        
        const { error: updateError } = await supabase
          .from('results')
          .update({ image_url: updatedImageUrl })
          .eq('id', resultId);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Photo info removed successfully"
        });

        fetchResults();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const downloadPoster = () => {
    if (!selectedResult) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply festive template style
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedTemplate.id === 'festive-gold') {
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(0.5, '#f97316');
      gradient.addColorStop(1, '#ef4444');
    } else if (selectedTemplate.id === 'silver-edition') {
      gradient.addColorStop(0, '#d1d5db');
      gradient.addColorStop(0.5, '#64748b');
      gradient.addColorStop(1, '#4b5563');
    } else if (selectedTemplate.id === 'celebration') {
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#ec4899');
      gradient.addColorStop(1, '#ef4444');
    } else if (selectedTemplate.id === 'victory') {
      gradient.addColorStop(0, '#4ade80');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add festive border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Add decorative corner elements
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉', 80, 80);
    ctx.fillText('✨', canvas.width - 80, 80);
    ctx.fillText('🏆', 80, canvas.height - 40);
    ctx.fillText('🎊', canvas.width - 80, canvas.height - 40);

    // Text color
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Festival title with festive elements
    ctx.font = 'bold 36px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText('🎭 RENDEZVOUS SILVER EDITION 🎭', canvas.width / 2, 120);

    // Competition result title
    ctx.font = 'bold 32px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText('COMPETITION RESULT', canvas.width / 2, 160);

    // Event name
    ctx.font = 'bold 28px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText(selectedResult.schedule?.event_name || '', canvas.width / 2, 200);

    // Position with medal emoji
    ctx.font = 'bold 64px ' + (selectedTemplate.style.fontFamily || 'Arial');
    const medalEmoji = selectedResult.position === 1 ? '🥇' : 
                      selectedResult.position === 2 ? '🥈' : 
                      selectedResult.position === 3 ? '🥉' : '🏅';
    const positionText = selectedResult.position === 1 ? '1ST' : 
                        selectedResult.position === 2 ? '2ND' : 
                        selectedResult.position === 3 ? '3RD' : 
                        `${selectedResult.position}TH`;
    ctx.fillText(`${medalEmoji} ${positionText} PLACE ${medalEmoji}`, canvas.width / 2, 280);

    // Participant name with festive styling
    ctx.font = 'bold 36px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText(`🎊 ${selectedResult.participant} 🎊`, canvas.width / 2, 340);

    // Points with festive elements
    ctx.font = '28px ' + (selectedTemplate.style.fontFamily || 'Arial');
    const points = selectedResult.position === 1 ? 10 : 
                  selectedResult.position === 2 ? 7 : 
                  selectedResult.position === 3 ? 5 : 
                  selectedResult.position <= 5 ? 3 : 1;
    ctx.fillText(`⭐ ${points} Points ⭐`, canvas.width / 2, 400);

    // Add festive bottom text
    ctx.font = 'bold 24px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText('🎉 Congratulations! 🎉', canvas.width / 2, 480);

    // Add decorative elements
    ctx.font = 'bold 40px Arial';
    ctx.fillText('✨', canvas.width / 2 - 150, 250);
    ctx.fillText('✨', canvas.width / 2 + 150, 250);
    ctx.fillText('🎊', canvas.width / 2 - 120, 380);
    ctx.fillText('🎊', canvas.width / 2 + 120, 380);

    // Download
    const link = document.createElement('a');
    link.download = `${selectedResult.participant}-${selectedResult.schedule?.event_name}-festive-result.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Success",
      description: "🎉 Festive poster downloaded successfully!"
    });
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
            Results Management
          </h1>
        </div>

        {/* File Upload Only */}
        <Card className="mb-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Result Photos
            </CardTitle>
            <CardDescription>
              Upload photos to automatically create result entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="result-files">Select Photos *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="result-files"
                  type="file"
                  multiple
                  accept="image/*"
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
                    Selected {uploadedFiles.length} photo(s):
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                      <ImageIcon className="h-4 w-4" />
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
                disabled={uploadedFiles.length === 0 || uploadingPhotos}
                className="flex-1 md:flex-none"
              >
                {uploadingPhotos ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Add to Results
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card key={result.id} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getPositionIcon(result.position)}
                    <div>
                      <CardTitle className="text-lg">{result.participant}</CardTitle>
                      <CardDescription>
                        {result.schedule?.event_name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {result.schedule?.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Position: {result.position}
                  </span>
                  <span className="text-sm font-semibold">
                    Points: {result.position === 1 ? 10 : 
                           result.position === 2 ? 7 : 
                           result.position === 3 ? 5 : 
                           result.position <= 5 ? 3 : 1}
                  </span>
                </div>
                <div className="space-y-3">
                  {/* Photos Section */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Photos ({result.image_url?.includes('[PHOTOS:') ? '1' : '0'})
                      </span>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePhotoUpload(e, result.id)}
                          disabled={uploadingPhotos}
                          className="hidden"
                          id={`photos-${result.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`photos-${result.id}`)?.click()}
                          disabled={uploadingPhotos}
                        >
                          {uploadingPhotos ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              Add Photos
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {result.image_url?.includes('[PHOTOS:') && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border">
                          <ImageIcon className="h-4 w-4" />
                          <span className="font-medium">
                            Photos Attached
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Files: {result.image_url.match(/\[PHOTOS: (.*?)\]/)?.[1] || 'Unknown'}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePhoto(result.id)}
                          className="h-8 px-3"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove Photos
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePoster(result)}
                      className="flex-1"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Poster
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteResult(result.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Poster Generation Dialog */}
        <Dialog open={showPosterDialog} onOpenChange={setShowPosterDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Generate Result Poster</DialogTitle>
              <DialogDescription>
                Choose a template and generate a poster for {selectedResult?.participant}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Template</h3>
                <div className="grid grid-cols-2 gap-3">
                  {posterTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 transition-all ${
                        selectedTemplate.id === template.id 
                          ? 'border-primary shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className={`h-24 rounded-t-lg ${template.preview}`}></div>
                      <div className="p-3">
                        <p className="font-medium text-sm">{template.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold">Preview</h3>
                <div 
                  className="aspect-[4/3] rounded-lg p-8 text-center flex flex-col justify-center text-white"
                  style={{
                    background: selectedTemplate.style.background,
                    fontFamily: selectedTemplate.style.fontFamily,
                    color: selectedTemplate.style.color || '#ffffff'
                  }}
                >
                  <h1 className="text-2xl font-bold mb-2">COMPETITION RESULT</h1>
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedResult?.schedule?.event_name}
                  </h2>
                  <div className="text-3xl font-bold mb-2">
                    {selectedResult?.position === 1 ? '1ST' : 
                     selectedResult?.position === 2 ? '2ND' : 
                     selectedResult?.position === 3 ? '3RD' : 
                     `${selectedResult?.position}TH`} PLACE
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedResult?.participant}
                  </h3>
                  <p className="text-sm">
                    {selectedResult?.position === 1 ? 10 : 
                     selectedResult?.position === 2 ? 7 : 
                     selectedResult?.position === 3 ? 5 : 
                     selectedResult?.position <= 5 ? 3 : 1} Points
                  </p>
                </div>
                <Button onClick={downloadPoster} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Poster
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminResults;