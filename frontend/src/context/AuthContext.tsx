import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isDevAuth: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevAuth, setIsDevAuth] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
          });
          setIsDevAuth(false);
          setLoading(false);
          return;
        }

        const savedDevUser = localStorage.getItem('cogniva_user') || localStorage.getItem('studypilot_dev_user');
        if (savedDevUser) {
          setUser(JSON.parse(savedDevUser));
          setIsDevAuth(true);
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
        });
        setIsDevAuth(false);
      } else if (!localStorage.getItem('cogniva_user')) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password?: string) => {
    try {
      if (password && !email.includes('demo') && !email.includes('dev')) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          });
          setIsDevAuth(false);
          return { success: true };
        }
      }

      const devUser: User = {
        id: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        email: email,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      };
      localStorage.setItem('cogniva_user', JSON.stringify(devUser));
      localStorage.setItem('cogniva_token', `dev-token-${devUser.id}`);
      setUser(devUser);
      setIsDevAuth(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    try {
      if (password && !email.includes('demo') && !email.includes('dev')) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName || data.user.email?.split('@')[0],
          });
          return { success: true };
        }
      }

      const devUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: fullName || email.split('@')[0],
      };
      localStorage.setItem('cogniva_user', JSON.stringify(devUser));
      localStorage.setItem('cogniva_token', `dev-token-${devUser.id}`);
      setUser(devUser);
      setIsDevAuth(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('cogniva_user');
    localStorage.removeItem('cogniva_token');
    localStorage.removeItem('studypilot_dev_user');
    localStorage.removeItem('studypilot_dev_token');
    setUser(null);
    setIsDevAuth(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isDevAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
