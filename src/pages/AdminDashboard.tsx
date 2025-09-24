import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Trophy, 
  Image, 
  Megaphone, 
  LogOut, 
  Users, 
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    scheduleCount: 0,
    resultsCount: 0,
    galleryCount: 0,
    announcementsCount: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await fetchStats();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [scheduleRes, resultsRes, galleryRes, announcementsRes] = await Promise.all([
        supabase.from('schedule').select('*', { count: 'exact' }),
        supabase.from('results').select('*', { count: 'exact' }),
        supabase.from('gallery').select('*', { count: 'exact' }),
        supabase.from('announcements').select('*', { count: 'exact' })
      ]);

      setStats({
        scheduleCount: scheduleRes.count || 0,
        resultsCount: resultsRes.count || 0,
        galleryCount: galleryRes.count || 0,
        announcementsCount: announcementsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    }
  };

  const adminSections = [
    {
      title: "Schedule Management",
      description: "Manage events and competitions",
      icon: Calendar,
      count: stats.scheduleCount,
      href: "/admin/schedule",
      color: "bg-blue-500/20 text-blue-600",
      gradient: "from-blue-500/20 to-blue-600/20"
    },
    {
      title: "Results Management",
      description: "Add results and generate posters",
      icon: Trophy,
      count: stats.resultsCount,
      href: "/admin/results",
      color: "bg-yellow-500/20 text-yellow-600",
      gradient: "from-yellow-500/20 to-yellow-600/20"
    },
    {
      title: "Gallery Management",
      description: "Upload and manage photos",
      icon: Image,
      count: stats.galleryCount,
      href: "/admin/gallery",
      color: "bg-green-500/20 text-green-600",
      gradient: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Announcements",
      description: "Create announcements with voice",
      icon: Megaphone,
      count: stats.announcementsCount,
      href: "/admin/announcements",
      color: "bg-purple-500/20 text-purple-600",
      gradient: "from-purple-500/20 to-purple-600/20"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Users className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full ${section.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {section.count}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mt-4">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.title} 
                className="border-0 shadow-xl bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(section.href)}
              >
                <CardHeader className={`bg-gradient-to-r ${section.gradient} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {section.count} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Click to manage {section.title.toLowerCase()}
                    </p>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                      <Plus className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/admin/results')} 
                className="h-20 flex flex-col gap-2"
              >
                <Trophy className="h-6 w-6" />
                Add New Result
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/schedule')}
                className="h-20 flex flex-col gap-2"
              >
                <Calendar className="h-6 w-6" />
                Create Event
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/announcements')}
                className="h-20 flex flex-col gap-2"
              >
                <Megaphone className="h-6 w-6" />
                New Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;