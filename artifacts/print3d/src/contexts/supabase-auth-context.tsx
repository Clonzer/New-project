import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, User } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  sendLoginCode: (email: string) => Promise<{ error: Error | null }>;
  verifyLoginCode: (email: string, token: string) => Promise<{ error: Error | null; data?: any }>;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Create basic user from auth data if profile doesn't exist
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const userMetadata = authData.user.user_metadata || {};
          const basicUser = {
            id: authData.user.id,
            email: authData.user.email || '',
            username: userMetadata.username || userMetadata.name || authData.user.email?.split('@')[0],
            displayName: userMetadata.display_name || userMetadata.displayName || userMetadata.name || userMetadata.username,
            role: userMetadata.role || 'buyer',
            isVerified: authData.user.email_confirmed_at ? true : false,
          };
          setUser(basicUser);

          // Try to create the profile in the background
          supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              username: basicUser.username,
              display_name: basicUser.displayName,
              role: basicUser.role,
            })
            .then(({ error: insertError }) => {
              if (insertError) {
                console.error('Error creating profile on fetch:', insertError);
              } else {
                console.log('Profile created successfully on fetch');
                // Don't refetch to avoid infinite loop - user will reload or navigate
              }
            });
        }
      } else {
        // Map database column names (snake_case) to User type (camelCase)
        setUser({
          ...(data as any),
          displayName: (data as any).display_name || (data as any).displayName,
          shopName: (data as any).shop_name || (data as any).shopName,
          shopMode: (data as any).shop_mode || (data as any).shopMode,
          avatarUrl: (data as any).avatar_url || (data as any).avatarUrl,
          isVerified: (data as any).is_verified || (data as any).isVerified,
        } as User);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function sendLoginCode(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Only allow existing users
      },
    });
    return { error };
  }

  async function verifyLoginCode(email: string, token: string) {
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { error, data };
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error };
  }

  async function register(email: string, password: string, userData: Partial<User>) {
    // First, create the auth user
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      return { error };
    }

    // Create profile manually to ensure data is saved
    if (authData.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            username: userData.username || userData.displayName || authData.user.email?.split('@')[0],
            display_name: userData.displayName || userData.username || authData.user.email?.split('@')[0],
            role: userData.role || 'buyer',
            location: userData.location || null,
            shop_name: userData.shopName || null,
            shop_mode: userData.shopMode || null,
            avatar_url: userData.avatarUrl || null,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail registration if profile creation fails
          // The trigger will try to create it
        }
      } catch (e) {
        console.error('Error in profile creation:', e);
      }
    }

    return { error };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    return { error };
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }

  async function refreshUser() {
    if (session?.user?.id) {
      await fetchUserProfile(session.user.id);
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    sendLoginCode,
    verifyLoginCode,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export AuthContextType as AuthContextValue for backward compatibility
export type AuthContextValue = AuthContextType;
