import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";


type User = {
  id: string;
  email: string;
  name: string;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
  };
};

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserGoals: (goals: User["goals"]) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user session and user data on mount
  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: data.name,
            goals: data.goals,
          });
        }
      }
      setIsLoading(false);
    };

    getUserData();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      toast({
        title: "Login failed",
        description: error?.message || "Invalid credentials",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }

    const userId = data.session.user.id;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      setCurrentUser({
        id: userId,
        email: data.session.user.email!,
        name: profile.name,
        goals: profile.goals,
      });

      toast({
        title: "Login successful!",
        description: `Welcome back, ${profile.name}!`,
      });

      return true;
    }

    toast({
      title: "Login failed",
      description: profileError?.message || "Unable to fetch profile",
      variant: "destructive",
    });

    setIsLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      toast({
        title: "Signup failed",
        description: error?.message || "Unable to create account",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }

    // Add extra user data
    const user = data.user;
    const defaultGoals = {
      calories: 2000,
      protein: 120,
      carbs: 250,
      sugar: 50,
      fat: 70,
    };

    const { error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          name,
          goals: defaultGoals,
        },
      ]);

    if (insertError) {
      toast({
        title: "Profile creation failed",
        description: insertError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }

    setCurrentUser({
      id: user.id,
      email,
      name,
      goals: defaultGoals,
    });

    toast({
      title: "Account created!",
      description: `Welcome to Calovate, ${name}!`,
    });

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUserGoals = async (goals: User["goals"]) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from("profiles")
      .update({ goals })
      .eq("id", currentUser.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrentUser({ ...currentUser, goals });

    toast({
      title: "Goals updated!",
      description: "Your nutrition goals have been updated.",
    });
  };

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    updateUserGoals,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
