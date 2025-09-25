import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    // Check fixed credentials
    if (email !== 'admin' || password !== 'admin12354') {
      setError('Invalid credentials. Only authorized officials can access this system.');
      setLoading(false);
      return;
    }

    try {
      // First check if admin user exists, if not create it
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const adminUser = existingUser.users.find(user => user.email === 'admin@system.local');
      
      if (!adminUser) {
        // Create admin user if it doesn't exist
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: 'admin@system.local',
          password: 'admin12354',
          email_confirm: true
        });
        
        if (createError) {
          // Try regular sign up as fallback
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@system.local',
            password: 'admin12354'
          });
          
          if (signUpError) throw signUpError;
        }
      }

      // Sign in with the admin credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@system.local',
        password: 'admin12354',
      });
      
      if (signInError) throw signInError;

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has admin role, if not assign it
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (!userRoles || userRoles.length === 0) {
          // Assign admin role
          await supabase
            .from('user_roles')
            .insert({ user_id: user.id, role: 'admin' });
        }
      }
      
      toast({
        title: "Welcome, Official!",
        description: "You have successfully accessed the admin system.",
      });
      
      navigate('/admin');
    } catch (error: any) {
      setError('System access failed. Please contact technical support.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Officials Portal
          </CardTitle>
          <CardDescription>
            Authorized access for festival officials only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleSignIn} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Access System
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">Official Credentials:</p>
                <p className="font-mono text-xs">Username: admin</p>
                <p className="font-mono text-xs">Password: admin12354</p>
              </div>
              <p className="text-xs">
                🔒 Secure access for authorized personnel only
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;