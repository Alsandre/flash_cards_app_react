import React, {createContext, useContext, useEffect, useState} from "react";
import type {User, Session, AuthError} from "@supabase/supabase-js";
import {supabase} from "../services/supabase";
import {useAppDispatch} from "../store/hooks";
import {authActions} from "../store/slices/authSlice";
import {AuthErrorBoundary} from "./AuthErrorBoundary";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{user: User | null; error: AuthError | null}>;
  signIn: (email: string, password: string) => Promise<{user: User | null; error: AuthError | null}>;
  signOut: () => Promise<{error: AuthError | null}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During development HMR or router initialization, context might not be ready
    // Return a safe default that will cause ProtectedRoute to show loading
    return {
      user: null,
      session: null,
      loading: true,
      signIn: async () => ({user: null, error: new Error("Auth not ready")}),
      signUp: async () => ({user: null, error: new Error("Auth not ready")}),
      signOut: async () => ({error: new Error("Auth not ready")}),
    };
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: {session: initialSession},
      } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);

      // Sync with Redux
      dispatch(authActions.setUser(initialSession?.user ?? null));
      dispatch(authActions.setAuthLoading(false));
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Sync with Redux
      dispatch(authActions.setUser(session?.user ?? null));
      dispatch(authActions.setAuthLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signUp = async (email: string, password: string) => {
    try {
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error("Sign Up Error:", error);
      }
      return {user: data.user, error};
    } catch (err) {
      console.error("Sign Up Exception:", err);
      const error = {
        message: err instanceof Error ? err.message : "Sign up failed",
        name: "AuthError",
      } as AuthError;
      return {user: null, error};
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Sign In Error:", error);
      }
      return {user: data.user, error};
    } catch (err) {
      console.error("Sign In Exception:", err);
      const error = {
        message: err instanceof Error ? err.message : "Sign in failed",
        name: "AuthError",
      } as AuthError;
      return {user: null, error};
    }
  };

  const signOut = async () => {
    try {
      const {error} = await supabase.auth.signOut();
      if (error) {
        console.error("Sign Out Error:", error);
      }
      return {error};
    } catch (err) {
      console.error("Sign Out Exception:", err);
      const error = {
        message: err instanceof Error ? err.message : "Sign out failed",
        name: "AuthError",
      } as AuthError;
      return {error};
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Auth Provider Error:", error, errorInfo);
        // Could dispatch to Redux error state here if needed
      }}
    >
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthErrorBoundary>
  );
};
