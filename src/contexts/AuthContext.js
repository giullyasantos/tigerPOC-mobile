import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get worker details from the database
          const { data: workerData, error } = await supabase
            .from('workers')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (!error && workerData) {
            setUser({
              id: workerData.id,
              email: workerData.email,
              name: workerData.name,
              role: 'worker'
            });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: workerData } = await supabase
          .from('workers')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (workerData) {
          setUser({
            id: workerData.id,
            email: workerData.email,
            name: workerData.name,
            role: 'worker'
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      // First, authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      // Then get worker details from the database
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('email', email)
        .single();

      if (workerError) {
        return {
          success: false,
          error: 'Worker profile not found'
        };
      }

      setUser({
        id: workerData.id,
        email: workerData.email,
        name: workerData.name,
        role: 'worker'
      });
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}