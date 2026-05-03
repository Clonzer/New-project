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
      // Fetch profile and XP data from users table (per migration 20240504_add_rank_system.sql)
      const { data, error } = await supabase
        .from('users')
        .select('*, total_xp, rank_id, login_streak, last_login_at, lifetime_pro')
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
            totalXp: 0,
            rankId: 1,
          };
          setUser(basicUser as User);

          // Try to create the user record in the background
          supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              username: basicUser.username,
              display_name: basicUser.displayName,
              role: basicUser.role,
              total_xp: 0,
              rank_id: 1,
            })
            .then(({ error: insertError }) => {
              if (insertError) {
                console.error('Error creating user record on fetch:', insertError);
              } else {
                console.log('User record created successfully on fetch');
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
          // Additional storefront fields
          bio: (data as any).bio || (data as any).bio,
          location: (data as any).location || (data as any).location,
          bannerUrl: (data as any).banner_url || (data as any).bannerUrl,
          shopAnnouncement: (data as any).shop_announcement || (data as any).shopAnnouncement,
          brandStory: (data as any).brand_story || (data as any).brandStory,
          websiteUrl: (data as any).website_url || (data as any).websiteUrl,
          instagramHandle: (data as any).instagram_handle || (data as any).instagramHandle,
          supportEmail: (data as any).support_email || (data as any).supportEmail,
          sellerTags: (data as any).seller_tags || (data as any).sellerTags,
          // XP and Rank data - now from users table
          totalXp: (data as any).total_xp || 0,
          rankId: (data as any).rank_id || 1,
          // Plan and subscription data
          planTier: (data as any).plan_tier || (data as any).planTier || 'starter',
          sponsorshipTier: (data as any).sponsorship_tier || (data as any).sponsorshipTier || 'free',
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

    // Create user record manually to ensure data is saved
    if (authData.user) {
      try {
        const { error: userRecordError } = await supabase
          .from('users')
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
            total_xp: 0,
            rank_id: 1,
            login_streak: 0,
          });

        if (userRecordError) {
          console.error('Error creating user record:', userRecordError);
          // Don't fail registration if user creation fails
          // The trigger will try to create it
        }
      } catch (e) {
        console.error('Error in user record creation:', e);
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
