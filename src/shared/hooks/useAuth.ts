import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  date_of_birth: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In development, check for mock user in localStorage
    if (import.meta.env.MODE === 'development') {
      const mockProfileRaw = localStorage.getItem('speakable-user-profile-v1');
      if (mockProfileRaw) {
        const mockProfile = JSON.parse(mockProfileRaw);
        // Fake a minimal user object compatible with Supabase User
        setUser({
          id: mockProfile.user_id || 'mock-user-123',
          email: 'mock@speakable.hk',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: '',
          confirmed_at: '',
          last_sign_in_at: '',
          updated_at: '',
          phone: '',
          email_confirmed_at: '',
          factors: [],
          phone_confirmed_at: '',
          banned_until: '',
          reauthentication_at: '',
        });
        setProfile({
          id: mockProfile.user_id || 'mock-user-123',
          user_id: mockProfile.user_id || 'mock-user-123',
          display_name: mockProfile.display_name || 'Mock User',
          first_name: mockProfile.first_name || 'Mock',
          last_name: mockProfile.last_name || 'User',
          username: mockProfile.username || 'mockuser',
          date_of_birth: mockProfile.date_of_birth || null,
          preferred_language: mockProfile.preferred_language || null,
          avatar_url: mockProfile.avatar_url || null,
        });
        setLoading(false);
        return;
      }
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  const updateLanguage = async (language: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_language: language })
      .eq('user_id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, preferred_language: language });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, profileData?: { firstName?: string; lastName?: string; username?: string; dateOfBirth?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    try {
      const displayName = profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            first_name: profileData?.firstName,
            last_name: profileData?.lastName,
            username: profileData?.username,
            date_of_birth: profileData?.dateOfBirth,
          }
        }
      });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Signup failed') };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateLanguage,
  };
}
