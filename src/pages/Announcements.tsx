import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  Clock, 
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Share2,
  Filter,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audio_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set((data || []).map(item => item.category))];
      setCategories(['all', ...uniqueCategories]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      default:
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    }
  };

  const handlePlayAudio = async (audioUrl: string, announcementId: string) => {
    try {
      // Stop current audio if playing
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      if (playingAudio === announcementId) {
        setPlayingAudio(null);
        return;
      }

      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        toast({
          title: "Audio Error",
          description: "Failed to play audio announcement",
          variant: "destructive"
        });
        setPlayingAudio(null);
      };

      await audio.play();
      setAudioElement(audio);
      setPlayingAudio(announcementId);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio announcement",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (announcement: Announcement) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: announcement.title,
          text: announcement.content,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${announcement.title}\n\n${announcement.content}`);
        toast({
          title: "Copied!",
          description: "Announcement copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadAudio = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Festival Announcements
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay updated with the latest festival news and updates
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              All Categories
            </Button>
            {categories.slice(1).map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedPriority === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedPriority('all')}
          >
            All Priorities
          </Button>
          <Button
            variant={selectedPriority === 'urgent' ? 'default' : 'outline'}
            onClick={() => setSelectedPriority('urgent')}
            className="text-red-600 border-red-500"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Urgent
          </Button>
          <Button
            variant={selectedPriority === 'high' ? 'default' : 'outline'}
            onClick={() => setSelectedPriority('high')}
            className="text-orange-600 border-orange-500"
          >
            High
          </Button>
          <Button
            variant={selectedPriority === 'medium' ? 'default' : 'outline'}
            onClick={() => setSelectedPriority('medium')}
            className="text-yellow-600 border-yellow-500"
          >
            Medium
          </Button>
          <Button
            variant={selectedPriority === 'low' ? 'default' : 'outline'}
            onClick={() => setSelectedPriority('low')}
            className="text-green-600 border-green-500"
          >
            Low
          </Button>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No announcements found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No announcements available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${getPriorityColor(announcement.priority)}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(announcement.priority)}
                      <div>
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(announcement.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {announcement.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize ${getPriorityColor(announcement.priority)}`}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                    
                    {announcement.audio_url && (
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlayAudio(announcement.audio_url!, announcement.id)}
                          className="flex items-center gap-2"
                        >
                          {playingAudio === announcement.id ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause Audio
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Play Audio
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAudio(announcement.audio_url!, announcement.title)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Volume2 className="h-4 w-4" />
                          <span>Audio announcement available</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(announcement)}
                          className="flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(announcement.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Priority Legend */}
        <Card className="mt-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Priority Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Urgent - Immediate attention required</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">High - Important information</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Medium - General updates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Low - Informational only</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Announcements;
