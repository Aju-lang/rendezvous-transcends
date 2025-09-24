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
import { ArrowLeft, Plus, Calendar as CalendarIcon, Edit, Trash2, Clock } from 'lucide-react';
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
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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

  const clearForm = () => {
    setEventName('');
    setCategory('');
    setDate(undefined);
    setTime('');
    setVenue('');
    setDescription('');
    setEditingEvent(null);
  };

  const addEvent = async () => {
    if (!eventName || !category || !date || !time || !venue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const eventData = {
        event_name: eventName,
        category,
        date: format(date, 'yyyy-MM-dd'),
        time,
        venue,
        description: description || null
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('schedule')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('schedule')
          .insert(eventData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event added successfully"
        });
      }

      clearForm();
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const editEvent = (event: ScheduleEvent) => {
    setEventName(event.event_name);
    setCategory(event.category);
    setDate(new Date(event.date));
    setTime(event.time);
    setVenue(event.venue);
    setDescription(event.description || '');
    setEditingEvent(event);
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully"
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

        {/* Add Event Form */}
        <Card className="mb-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </CardTitle>
            <CardDescription>
              {editingEvent ? 'Update event details' : 'Create a new scheduled event'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter event name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Enter venue"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addEvent} className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
              {editingEvent && (
                <Button variant="outline" onClick={clearForm}>
                  Cancel
                </Button>
              )}
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
                  {event.description && (
                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editEvent(event)}
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