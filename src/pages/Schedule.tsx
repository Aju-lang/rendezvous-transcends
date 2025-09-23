import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleEvent {
  id: string;
  event_name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
}

const Schedule = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    }
  }, [events, selectedCategory]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'competition':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'workshop':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'talk':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const groupEventsByDate = (events: ScheduleEvent[]) => {
    return events.reduce((groups, event) => {
      const date = event.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {} as Record<string, ScheduleEvent[]>);
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
              Festival Schedule
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete timeline of all events, competitions, workshops, and talks during RENDEZVOUS Silver Edition
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="competition">Competitions</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="talk">Talks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events */}
          {Object.keys(groupedEvents).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory === "all" 
                  ? "No events scheduled yet. Check back soon!" 
                  : `No ${selectedCategory} events found. Try a different filter.`}
              </p>
              <Button onClick={() => setSelectedCategory("all")} variant="outline">
                View All Events
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-foreground">
                      {formatDate(date)}
                    </h2>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateEvents.map((event) => (
                      <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {event.event_name}
                              </CardTitle>
                              <Badge className={`mt-2 ${getCategoryColor(event.category)}`}>
                                {event.category}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.venue}</span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Schedule;