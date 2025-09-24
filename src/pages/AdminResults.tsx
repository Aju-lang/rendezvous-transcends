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
import { ArrowLeft, Plus, Trophy, Medal, Award, Edit, Trash2, Download, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Result {
  id: string;
  participant: string;
  position: number;
  points: number;
  event_id: string;
  image_url?: string;
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
    id: 'modern',
    name: 'Modern Gradient',
    preview: 'bg-gradient-to-br from-blue-600 to-purple-600',
    style: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      fontFamily: 'Inter, sans-serif'
    }
  },
  {
    id: 'classic',
    name: 'Classic Gold',
    preview: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    style: {
      background: 'linear-gradient(135deg, #fbbf24, #f97316)',
      fontFamily: 'Times New Roman, serif'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal White',
    preview: 'bg-gradient-to-br from-gray-100 to-gray-300',
    style: {
      background: 'linear-gradient(135deg, #f3f4f6, #d1d5db)',
      fontFamily: 'Helvetica, sans-serif',
      color: '#1f2937'
    }
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    preview: 'bg-gradient-to-br from-cyan-400 to-pink-500',
    style: {
      background: 'linear-gradient(135deg, #22d3ee, #ec4899)',
      fontFamily: 'Courier New, monospace'
    }
  }
];

const AdminResults = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participant, setParticipant] = useState('');
  const [position, setPosition] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(posterTemplates[0]);
  const [showPosterDialog, setShowPosterDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchResults();
    fetchEvents();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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

  const addResult = async () => {
    if (!selectedEvent || !participant || !position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('results')
        .insert({
          event_id: selectedEvent,
          participant,
          position: parseInt(position)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result added successfully"
      });

      setSelectedEvent('');
      setParticipant('');
      setPosition('');
      fetchResults();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result deleted successfully"
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

  const downloadPoster = () => {
    if (!selectedResult) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply template style
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedTemplate.id === 'modern') {
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
    } else if (selectedTemplate.id === 'classic') {
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f97316');
    } else if (selectedTemplate.id === 'minimal') {
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#d1d5db');
    } else if (selectedTemplate.id === 'neon') {
      gradient.addColorStop(0, '#22d3ee');
      gradient.addColorStop(1, '#ec4899');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text color
    ctx.fillStyle = selectedTemplate.id === 'minimal' ? '#1f2937' : '#ffffff';
    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 48px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText('COMPETITION RESULT', canvas.width / 2, 100);

    // Event name
    ctx.font = 'bold 36px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText(selectedResult.schedule?.event_name || '', canvas.width / 2, 180);

    // Position
    ctx.font = 'bold 72px ' + (selectedTemplate.style.fontFamily || 'Arial');
    const positionText = selectedResult.position === 1 ? '1ST' : 
                        selectedResult.position === 2 ? '2ND' : 
                        selectedResult.position === 3 ? '3RD' : 
                        `${selectedResult.position}TH`;
    ctx.fillText(positionText + ' PLACE', canvas.width / 2, 320);

    // Participant name
    ctx.font = 'bold 42px ' + (selectedTemplate.style.fontFamily || 'Arial');
    ctx.fillText(selectedResult.participant, canvas.width / 2, 420);

    // Points
    ctx.font = '32px ' + (selectedTemplate.style.fontFamily || 'Arial');
    const points = selectedResult.position === 1 ? 10 : 
                  selectedResult.position === 2 ? 7 : 
                  selectedResult.position === 3 ? 5 : 
                  selectedResult.position <= 5 ? 3 : 1;
    ctx.fillText(`${points} Points`, canvas.width / 2, 500);

    // Download
    const link = document.createElement('a');
    link.download = `${selectedResult.participant}-${selectedResult.schedule?.event_name}-result.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Success",
      description: "Poster downloaded successfully"
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

        {/* Add Result Form */}
        <Card className="mb-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Result
            </CardTitle>
            <CardDescription>
              Add competition results and generate posters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.event_name} - {event.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="participant">Participant</Label>
                <Input
                  id="participant"
                  value={participant}
                  onChange={(e) => setParticipant(e.target.value)}
                  placeholder="Enter participant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Enter position"
                  min="1"
                />
              </div>
            </div>
            <Button onClick={addResult} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
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