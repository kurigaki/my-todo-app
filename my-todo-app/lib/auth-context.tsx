"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
  register: (name: string, email: string) => Promise<User | null>;
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = "kanban-current-user-id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data as User[];
  };

  // Refresh users list
  const refreshUsers = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
  };

  // Load users and restore login state on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      // Fetch users from Supabase
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);

      // Restore login state from localStorage
      const storedUserId = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUserId) {
        const currentUser = fetchedUsers.find((u) => u.id === storedUserId);
        if (currentUser) {
          setUser(currentUser);
        } else {
          // User no longer exists, clear storage
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      }

      setIsLoading(false);
    };

    initialize();
  }, []);

  const login = (userId: string) => {
    const foundUser = users.find((u) => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, userId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const register = async (name: string, email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email }])
      .select("id, name, email")
      .single();

    if (error) {
      console.error("Error registering user:", error);
      return null;
    }

    const newUser = data as User;

    // Update users list
    setUsers((prev) => [...prev, newUser]);

    // Auto login
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, newUser.id);

    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, register, isLoading, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
