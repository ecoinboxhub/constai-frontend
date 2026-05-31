"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode and validate token if needed
        setUser({ authenticated: true });
      } catch (err) {
        console.error("Error parsing token:", err);
      }
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
