"use client";

import { LocalStorage } from "@/lib/info";
import { TokenType } from "@/lib/types";
import { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean; // Whether the user is authenticated
    login: (access_token: TokenType) => void; // Function to log the user in
    logout: () => void; // Function to log the user out
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that provides authentication context to its children.
 * This component manages the authentication state and provides login and logout functions.
 * @param {AuthProviderProps} props - The properties for the AuthProvider component.
 * @return {React.FC<AuthProviderProps>} The AuthProvider component.
 */
export function AuthProvider({ children }: AuthProviderProps): ReactNode {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window === "undefined") {
            console.debug("Window is undefined");
            return false; // Server-side rendering
        }

        const stored_auth_state = localStorage.getItem(LocalStorage.access_token);
        return stored_auth_state !== null;
    });

    /**
     * Log the user in by setting the access token in local storage and updating the authentication state.
     * @param {TokenType} access_token - The access token to set in local storage.
     */
    const login = (access_token: TokenType) => {
        console.debug("Setting local login state to true");
        localStorage.setItem(LocalStorage.access_token, JSON.stringify(access_token));
        setIsAuthenticated(true);
    };

    /**
     * Log the user out by removing the access token from local storage and updating the authentication state.
     */
    const logout = () => {
        console.debug("Setting local login state to false");
        setIsAuthenticated(false);
        localStorage.removeItem(LocalStorage.access_token);
        localStorage.removeItem(LocalStorage.user_data);
        localStorage.removeItem(LocalStorage.user_permissions);
        localStorage.removeItem(LocalStorage.user_avatar);
    };

    return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the authentication context.
 * This hook is used to access the authentication context in a component.
 * @returns {AuthContextType} The authentication context containing the authentication state and functions.
 */
export function useAuth(): AuthContextType {
    console.debug("useAuth called");
    const ctx = useContext(AuthContext);
    if (!ctx) {
        const errorMessage = "useAuth must be used within an AuthProvider";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return ctx;
}
