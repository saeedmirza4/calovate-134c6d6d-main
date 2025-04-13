import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";

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

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;

          setCurrentUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            goals: profile.goals,
          });
        }
      } catch (err: any) {
        console.error("Session load error:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.session) throw new Error("No session returned");

      const userId = data.session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw new Error(profileError.message);

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
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Signup failed");

      const defaultGoals = {
        calories: 2000,
        protein: 120,
        carbs: 250,
        sugar: 50,
        fat: 70,
      };

      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name,
          goals: defaultGoals,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      setCurrentUser({
        id: data.user.id,
        email,
        name,
        goals: defaultGoals,
      });

      toast({
        title: "Signup successful!",
        description: `Welcome to Calovate, ${name}!`,
      });

      return true;
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const updateUserGoals = async (goals: User["goals"]) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ goals })
        .eq("id", currentUser.id);

      if (error) throw new Error(error.message);

      setCurrentUser({ ...currentUser, goals });

      toast({
        title: "Goals updated!",
        description: "Your nutrition goals have been updated.",
      });
    } catch (error: any) {
      console.error("Goal update error:", error.message);
      toast({
        title: "Update failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    updateUserGoals,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
