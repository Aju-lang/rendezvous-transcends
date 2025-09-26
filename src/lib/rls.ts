import { supabase } from '@/integrations/supabase/client';

export const disableRLS = async () => {
  try {
    console.log('Disabling RLS for all tables...');
    
    const tables = ['schedule', 'results', 'gallery', 'announcements'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
        });
        
        if (error) {
          console.warn(`Could not disable RLS for ${table}:`, error.message);
        } else {
          console.log(`✅ RLS disabled for ${table}`);
        }
      } catch (error) {
        console.warn(`Error disabling RLS for ${table}:`, error);
      }
    }
    
    console.log('RLS setup complete!');
  } catch (error) {
    console.error('Error disabling RLS:', error);
  }
};
