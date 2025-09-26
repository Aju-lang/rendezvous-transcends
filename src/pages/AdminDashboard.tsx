import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Trophy, 
  Image, 
  Megaphone, 
  LogOut, 
  Users, 
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
  Activity,
  Star,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createSampleData } from '@/lib/sampleData';
import { ensureStorageBuckets } from '@/lib/storage';
import { disableRLS } from '@/lib/rls';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    scheduleCount: 0,
    resultsCount: 0,
    galleryCount: 0,
    announcementsCount: 0,
    totalViews: 0,
    activeUsers: 0,
    recentActivity: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
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
        
        setUser({ email: session.email });
        fetchStats();
        ensureStorageBuckets(); // Ensure storage buckets exist
        disableRLS(); // Disable RLS for local development
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('adminSession');
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [scheduleRes, resultsRes, galleryRes, announcementsRes] = await Promise.all([
        supabase.from('schedule').select('*', { count: 'exact' }),
        supabase.from('results').select('*', { count: 'exact' }),
        supabase.from('gallery').select('*', { count: 'exact' }),
        supabase.from('announcements').select('*', { count: 'exact' })
      ]);

      // Calculate additional stats
      const totalItems = (scheduleRes.count || 0) + (resultsRes.count || 0) + (galleryRes.count || 0) + (announcementsRes.count || 0);
      const recentActivity = Math.floor(Math.random() * 50) + 10; // Simulated recent activity

      setStats({
        scheduleCount: scheduleRes.count || 0,
        resultsCount: resultsRes.count || 0,
        galleryCount: galleryRes.count || 0,
        announcementsCount: announcementsRes.count || 0,
        totalViews: totalItems * 25 + Math.floor(Math.random() * 100), // Simulated views
        activeUsers: Math.floor(Math.random() * 150) + 50, // Simulated active users
        recentActivity: recentActivity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminSession');
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate('/auth');
  };

  const handleCreateSampleData = async () => {
    try {
      const success = await createSampleData();
      if (success) {
        toast({
          title: "Sample Data Created",
          description: "Sample events, announcements, and gallery items have been added successfully!"
        });
        await fetchStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: "Failed to create sample data",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive"
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
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
                <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Welcome back, Festival Administrator
            </p>
            <div className="absolute -top-2 -right-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-primary/10">
              <Users className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-1">{stats.totalViews}</h3>
              <p className="text-sm text-muted-foreground mb-2">Total Page Views</p>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">+12% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  <Star className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-1">{stats.activeUsers}</h3>
              <p className="text-sm text-muted-foreground mb-2">Active Users</p>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">+8% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Today
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-purple-600 mb-1">{stats.recentActivity}</h3>
              <p className="text-sm text-muted-foreground mb-2">Recent Activities</p>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">+15% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${section.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-gradient-to-r from-primary/20 to-secondary/20">
                      {section.count}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  <div className="mt-3">
                    <Progress value={Math.min((section.count / 10) * 100, 100)} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            const isEven = index % 2 === 0;
            return (
              <Card 
                key={section.title} 
                className="border-0 shadow-xl bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                onClick={() => navigate(section.href)}
              >
                {/* Festive Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute ${isEven ? 'top-4 right-4' : 'bottom-4 left-4'} w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 animate-pulse`}></div>
                  <div className={`absolute ${isEven ? 'bottom-8 left-8' : 'top-8 right-8'} w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 animate-bounce`}></div>
                </div>
                
                <CardHeader className={`bg-gradient-to-r ${section.gradient} rounded-t-lg relative z-10`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-300 relative">
                        <Icon className="h-8 w-8 text-white" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl group-hover:text-yellow-200 transition-colors">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white group-hover:bg-white/30 transition-colors">
                        {section.count} items
                      </Badge>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-2">
                        Click to manage {section.title.toLowerCase()}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        <span>Festival Ready</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
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
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm relative overflow-hidden">
          {/* Festive Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-yellow-500 animate-ping"></div>
          </div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="relative">
                <Settings className="h-6 w-6 text-yellow-600" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Quick Actions
              </span>
              <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />
            </CardTitle>
            <p className="text-muted-foreground mt-2">Festival management at your fingertips</p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate('/admin/results')} 
                className="h-24 flex flex-col gap-3 bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 group"
              >
                <div className="relative">
                  <Trophy className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  <Star className="h-3 w-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="font-semibold">Add New Result</span>
                <span className="text-xs opacity-80">Celebrate winners!</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/schedule')}
                className="h-24 flex flex-col gap-3 border-2 border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500 transition-all duration-300 group"
              >
                <div className="relative">
                  <Calendar className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  <Sparkles className="h-3 w-3 text-blue-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <span className="font-semibold text-blue-600">Create Event</span>
                <span className="text-xs text-blue-500">Schedule the magic!</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/announcements')}
                className="h-24 flex flex-col gap-3 border-2 border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300 group"
              >
                <div className="relative">
                  <Megaphone className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  <Zap className="h-3 w-3 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="font-semibold text-purple-600">New Announcement</span>
                <span className="text-xs text-purple-500">Spread the word!</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCreateSampleData}
                className="h-24 flex flex-col gap-3 border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500 transition-all duration-300 group"
              >
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <Crown className="h-3 w-3 text-green-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <span className="font-semibold text-green-600">Sample Data</span>
                <span className="text-xs text-green-500">Create test data!</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;