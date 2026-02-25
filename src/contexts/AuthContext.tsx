import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'counselor' | 'student';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch role from user_roles table.
   * If no row found, fall back to user_metadata.role (set during signup).
   * If metadata has a role, auto-insert it into user_roles for future lookups.
   */
  const fetchUserRole = async (user: User) => {
    try {
      console.log('[AuthContext] Fetching role for user:', user.id);

      // 1. Try the user_roles table first
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[AuthContext] user_roles result:', { data, error });

      if (error) {
        console.error('[AuthContext] Error fetching user role:', error);
      }

      if (data?.role) {
        console.log('[AuthContext] Role found in user_roles:', data.role);
        setUserRole(data.role as AppRole);
        return;
      }

      // 2. Fall back to user_metadata (stored during signup)
      const metaRole = user.user_metadata?.role as AppRole | undefined;
      console.log('[AuthContext] Role from user_metadata:', metaRole);

      if (metaRole && ['admin', 'counselor', 'student'].includes(metaRole)) {
        setUserRole(metaRole);

        // Auto-insert into user_roles so future lookups work
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: metaRole })
          .select()
          .single();

        if (insertError) {
          // Might be a duplicate if another tab already inserted — that's fine
          console.warn('[AuthContext] Could not auto-insert user_role (may already exist):', insertError.message);
        } else {
          console.log('[AuthContext] Auto-inserted role into user_roles:', metaRole);
        }
        return;
      }

      // 3. No role found anywhere
      console.warn('[AuthContext] No role found for user. user_id:', user.id);
      setUserRole(null);
    } catch (err) {
      console.error('[AuthContext] Error in fetchUserRole:', err);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(() => {
            if (mounted) {
              fetchUserRole(session.user);
            }
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) {
        return { error };
      }

      // Create profile and role for the new user
      if (data.user) {
        // Insert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            email: email,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Insert role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role,
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }

        // If student role, create student record
        if (role === 'student') {
          const { error: studentError } = await supabase
            .from('students')
            .insert({
              user_id: data.user.id,
              student_id: `STU${Date.now()}`,
              full_name: fullName,
              email: email,
              department: 'Unassigned',
              semester: 1,
            });

          if (studentError) {
            console.error('Student record creation error:', studentError);
          }
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      isLoading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}