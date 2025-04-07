"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { LocalStorage } from "@/lib/info";

interface AuthContextType {
  is_authenticated: boolean; // Whether the user is authenticated
  login: (token: string) => void; // Function to log the user in
  logout: () => void; // Function to log the user out
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [is_authenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      console.debug("Window is undefined");
      return false;
    }

    console.debug("Window is defined");
    const stored_auth_state = localStorage.getItem(LocalStorage.jwt_name);
    return stored_auth_state !== null;
  });

  /// Log the user in
  const login = (token: string) => {
    setIsAuthenticated(true);
    localStorage.setItem(LocalStorage.jwt_name, token);
  };

  /// Log the user out
  const logout = () => {
    console.log("Logging out");
    setIsAuthenticated(false);
    localStorage.removeItem(LocalStorage.jwt_name);
  };

  return (
    <AuthContext.Provider value={{ is_authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/// Hook to access the authentication context.
// This hook is used to access the authentication context in a component
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  console.log(ctx);
  return ctx;
}
