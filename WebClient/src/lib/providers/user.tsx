import { UserPublicType } from "@/lib/types";
import { createContext, ReactNode, useContext, useState } from "react";

interface UserContextType {
    userInfo: UserPublicType | null;
    userAvatar: Blob | null;
    updateUserInfo: (userInfo: UserPublicType) => void;
    clearUserInfo: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: UserProviderProps): ReactNode {
    const [userInfo, setUserInfo] = useState<UserPublicType | null>(null);
    const [userAvatar, setUserAvatar] = useState<Blob | null>(null);

    /**
     * Update the user information and optionally the user avatar.
     * @param {UserPublicType} userInfo - The user information to set.
     * @param {Blob | null}
     */
    const updateUserInfo = (userInfo: UserPublicType, userAvatar?: Blob | null) => {
        console.debug("Setting user info", { userInfo, userAvatar });
        setUserInfo(userInfo);
        if (userAvatar) {
            setUserAvatar(userAvatar);
        }
    };

    /**
     * Clear the user information and avatar.
     */
    const clearUserInfo = () => {
        setUserInfo(null);
        setUserAvatar(null);
    };

    return (
        <UserContext.Provider value={{ userInfo, userAvatar, updateUserInfo, clearUserInfo }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook to access the user context.
 * This hook is used to access the user context in a component.
 * @returns {UserContextType} The user context containing the user information and avatar.
 */
export function useUser(): UserContextType {
    console.debug("useUser called");
    const ctx = useContext(UserContext);
    if (!ctx) {
        const errorMessage = "useUser must be used within an UserProvider";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return ctx;
}
