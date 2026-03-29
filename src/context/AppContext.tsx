import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  overall_nutrients_sheet: Record<string, number[]>;
  attendance: boolean[];
  frequency: number[];
  time_frame: number | null; 
  start_date: string | null;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  daysConfigured: number | null;
  isDark: boolean;
  login: (credentials: { username?: string; email?: string; password: string }) => Promise<void>;
  signup: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setDays: (val: number) => void;
  updateUser: (updatedUser: any) => void; 
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("auth") === "true");
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  const [daysConfigured, setDaysConfigured] = useState<number | null>(() => {
    const d = localStorage.getItem("days");
    return d ? Number(d) : null;
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const syncUser = (rawUserData: any) => {
    if (!rawUserData) {
      setUser(null);
      setDaysConfigured(null);
      localStorage.removeItem("user");
      localStorage.removeItem("days");
      return;
    }

    const formattedUser: User = {
      id: rawUserData.id || rawUserData._id,
      username: rawUserData.username,
      email: rawUserData.email,
      overall_nutrients_sheet: rawUserData.overall_nutrients_sheet || rawUserData.overall_nutrient_sheet,
      attendance: rawUserData.attendance || [],
      frequency: rawUserData.frequency || [],
      time_frame: rawUserData.time_frame || null,
      start_date: rawUserData.start_date || null,
    };

    setUser(formattedUser);
    setIsAuthenticated(true);
    localStorage.setItem("auth", "true");
    localStorage.setItem("user", JSON.stringify(formattedUser));
    
    // Crucial for Reset: if time_frame is null, remove it from state and storage
    if (formattedUser.time_frame) {
      setDaysConfigured(formattedUser.time_frame);
      localStorage.setItem("days", formattedUser.time_frame.toString());
    } else {
      setDaysConfigured(null);
      localStorage.removeItem("days");
    }
  };

  const login = async (credentials: { username?: string; email?: string; password: string }) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      user_name_or_email: credentials.username || credentials.email,
      password: credentials.password
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error(err);
    throw new Error(err.detail || "Login failed");
  }

  const data = await response.json();
  syncUser(data.user);
};

  const signup = async (userData: { username: string; email: string; password: string }) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Signup failed");
    const data = await response.json();
    syncUser(data.user);
  };

  const setDays = (val: number) => {
    setDaysConfigured(val);
    localStorage.setItem("days", val.toString());
    if (user) {
      const updated = { ...user, time_frame: val };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setDaysConfigured(null);
      localStorage.clear();
      window.location.replace("/");
    }
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, user, daysConfigured, isDark: true, login, signup, setDays, logout, updateUser: syncUser }}>
      {children}
    </AppContext.Provider>
  );
};