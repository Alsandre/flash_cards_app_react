import React, {useState} from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "./AuthProvider";
import {LoginForm} from "./LoginForm";
import {SignupForm} from "./SignupForm";
import {Card} from "../components/ui";

export const AuthPage: React.FC = () => {
  const {user, loading} = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Redirect if already authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">FlipFlop</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Your personal flashcard study companion</p>
        </div>

        {/* Auth Form Card */}
        <Card className="p-8">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button onClick={() => setMode("login")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === "login" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"}`}>
              Sign In
            </button>
            <button onClick={() => setMode("signup")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === "signup" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"}`}>
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  );
};
