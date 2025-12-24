"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AuthContextType {
  userInfo: any;
  loading: boolean;
  refreshUserInfo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserInfo = useCallback(async () => {
    const accessToken = sessionStorage.getItem("access_token");
    if (!accessToken) {
      setUserInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:4001/oauth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        console.error("Failed to fetch user info:", response.status);
        // If token is invalid, we might want to clear it,
        // but for now let's just null the user info
        setUserInfo(null);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUserInfo(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  return (
    <AuthContext.Provider
      value={{ userInfo, loading, refreshUserInfo, logout }}
    >
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
