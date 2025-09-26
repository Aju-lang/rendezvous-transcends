import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Megaphone, Edit, Trash2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audio_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-600' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-600' }
];

const voices = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Male)' },
  { value: 'fable', label: 'Fable (British Male)' },
  { value: 'onyx', label: 'Onyx (Deep Male)' },
  { value: 'nova', label: 'Nova (Female)' },
  { value: 'shimmer', label: 'Shimmer (Soft Female)' }
];

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
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

  const clearForm = () => {
    setTitle('');
    setContent('');
    setPriority('medium');
    setCategory('');
    setSelectedVoice('alloy');
    setEditingAnnouncement(null);
  };

  const generateAudio = async (text: string, voice: string = selectedVoice) => {
    setGeneratingAudio(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      // Create audio element and play
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();

      toast({
        title: "Audio Generated",
        description: "Playing announcement audio"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to generate audio',
        variant: "destructive"
      });
    } finally {
      setGeneratingAudio(false);
    }
  };

  const addAnnouncement = async () => {
    if (!title.trim() || !content.trim() || !category.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        priority,
        category: category.trim(),
        is_active: true
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Announcement updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Announcement added successfully"
        });
      }

      clearForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setPriority(announcement.priority);
    setCategory(announcement.category);
    setEditingAnnouncement(announcement);
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });

      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const playAnnouncementAudio = async (announcement: Announcement) => {
    if (playingAudio === announcement.id) {
      // Stop current audio
      if (audioElements[announcement.id]) {
        audioElements[announcement.id].pause();
        audioElements[announcement.id].currentTime = 0;
      }
      setPlayingAudio(null);
      return;
    }

    try {
      setPlayingAudio(announcement.id);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: announcement.content, voice: 'alloy' }
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      
      audio.onended = () => {
        setPlayingAudio(null);
      };

      audio.onerror = () => {
        setPlayingAudio(null);
        toast({
          title: "Error",
          description: "Failed to play audio",
          variant: "destructive"
        });
      };

      setAudioElements(prev => ({ ...prev, [announcement.id]: audio }));
      await audio.play();

    } catch (error: any) {
      setPlayingAudio(null);
      toast({
        title: "Error",
        description: error.message || 'Failed to generate audio',
        variant: "destructive"
      });
    }
  };

  const getPriorityConfig = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
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
            Announcements Management
          </h1>
        </div>

        {/* Add Announcement Form */}
        <Card className="mb-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </CardTitle>
            <CardDescription>
              Create announcements with voice synthesis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice">Voice for Preview</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addAnnouncement} className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                {editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
              </Button>
              <Button
                variant="outline"
                onClick={() => generateAudio(content)}
                disabled={!content.trim() || generatingAudio}
              >
                {generatingAudio ? (
                  <>
                    <VolumeX className="h-4 w-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Preview Audio
                  </>
                )}
              </Button>
              {editingAnnouncement && (
                <Button variant="outline" onClick={clearForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((announcement) => {
            const priorityConfig = getPriorityConfig(announcement.priority);
            return (
              <Card key={announcement.id} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <CardDescription>
                          {announcement.category} • {new Date(announcement.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <p className="text-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playAnnouncementAudio(announcement)}
                      disabled={playingAudio === announcement.id}
                    >
                      {playingAudio === announcement.id ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play Audio
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editAnnouncement(announcement)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {announcements.length === 0 && (
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-muted-foreground">
                Create your first announcement to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;