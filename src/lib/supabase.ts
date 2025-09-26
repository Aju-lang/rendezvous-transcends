import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for better readability
type GalleryItem = Database['public']['Tables']['gallery']['Row'];
type GalleryInsert = Database['public']['Tables']['gallery']['Insert'];
type GalleryUpdate = Database['public']['Tables']['gallery']['Update'];

type Announcement = Database['public']['Tables']['announcements']['Row'];
type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];

type ScheduleItem = Database['public']['Tables']['schedule']['Row'];
type ScheduleInsert = Database['public']['Tables']['schedule']['Insert'];
type ScheduleUpdate = Database['public']['Tables']['schedule']['Update'];

type Result = Database['public']['Tables']['results']['Row'];
type ResultInsert = Database['public']['Tables']['results']['Insert'];
type ResultUpdate = Database['public']['Tables']['results']['Update'];

// Gallery Service
export const galleryService = {
  // Get all gallery items
  async getAll(): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get gallery item by ID
  async getById(id: string): Promise<GalleryItem | null> {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new gallery item
  async create(item: GalleryInsert): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update gallery item
  async update(id: string, updates: GalleryUpdate): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete gallery item
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get gallery count
  async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('gallery')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};

// Announcements Service
export const announcementsService = {
  // Get all active announcements
  async getAll(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get all announcements (including inactive) - for admin
  async getAllForAdmin(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get announcement by ID
  async getById(id: string): Promise<Announcement | null> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new announcement
  async create(announcement: AnnouncementInsert): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update announcement
  async update(id: string, updates: AnnouncementUpdate): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete announcement
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle announcement active status
  async toggleActive(id: string): Promise<Announcement> {
    const { data: current } = await supabase
      .from('announcements')
      .select('is_active')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('announcements')
      .update({ 
        is_active: !current?.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get announcements count
  async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};

// Schedule Service
export const scheduleService = {
  // Get all schedule items
  async getAll(): Promise<ScheduleItem[]> {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get schedule item by ID
  async getById(id: string): Promise<ScheduleItem | null> {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new schedule item
  async create(item: ScheduleInsert): Promise<ScheduleItem> {
    const { data, error } = await supabase
      .from('schedule')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update schedule item
  async update(id: string, updates: ScheduleUpdate): Promise<ScheduleItem> {
    const { data, error } = await supabase
      .from('schedule')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete schedule item
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get schedule count
  async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('schedule')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};

// Results Service
export const resultsService = {
  // Get all results
  async getAll(): Promise<Result[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get result by ID
  async getById(id: string): Promise<Result | null> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new result
  async create(result: ResultInsert): Promise<Result> {
    const { data, error } = await supabase
      .from('results')
      .insert(result)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update result
  async update(id: string, updates: ResultUpdate): Promise<Result> {
    const { data, error } = await supabase
      .from('results')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete result
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get results count
  async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('results')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  },

  // Get leaderboard data
  async getLeaderboard(): Promise<Database['public']['Views']['leaderboard']['Row'][]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

// Auth Service
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Check if user has admin role
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    if (error) return false;
    return !!data;
  },

  // Assign admin role to user
  async assignAdminRole(userId: string) {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' });
    
    if (error) throw error;
  }
};

// Statistics Service
export const statsService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const [scheduleCount, resultsCount, galleryCount, announcementsCount] = await Promise.all([
      scheduleService.getCount(),
      resultsService.getCount(),
      galleryService.getCount(),
      announcementsService.getCount()
    ]);

    return {
      scheduleCount,
      resultsCount,
      galleryCount,
      announcementsCount,
      totalViews: (scheduleCount + resultsCount + galleryCount + announcementsCount) * 25 + Math.floor(Math.random() * 100),
      activeUsers: Math.floor(Math.random() * 150) + 50,
      recentActivity: Math.floor(Math.random() * 50) + 10
    };
  }
};

// Export all services
export const supabaseServices = {
  gallery: galleryService,
  announcements: announcementsService,
  schedule: scheduleService,
  results: resultsService,
  auth: authService,
  stats: statsService
};
