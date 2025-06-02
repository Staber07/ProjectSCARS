import { UserPublicType } from "@/lib/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { LocalStorage } from "@/lib/info";

interface UserContextType {
    userInfo: UserPublicType | null;
    userAvatar: Blob | null;
    userAvatarUrl: string | null;
    updateUserInfo: (userInfo: UserPublicType, userAvatar?: Blob | null) => void;
    clearUserInfo: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: UserProviderProps): ReactNode {
    const [userInfo, setUserInfo] = useState<UserPublicType | null>(null);
    const [userAvatar, setUserAvatar] = useState<Blob | null>(null);
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const storedUserInfo = localStorage.getItem(LocalStorage.user_data);
            const storedUserAvatar = localStorage.getItem(LocalStorage.user_avatar);
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
            }
            if (storedUserAvatar) {
                try {
                    // Decode base64 data URL to blob
                    const response = await fetch(storedUserAvatar);
                    const avatarBlob = await response.blob();
                    setUserAvatar(avatarBlob);
                    setUserAvatarUrl((prevUrl) => {
                        if (prevUrl) {
                            URL.revokeObjectURL(prevUrl);
                        }
                        return URL.createObjectURL(avatarBlob);
                    });
                } catch (error) {
                    console.error("Failed to decode user avatar:", error);
                }
            }
        };

        loadUserData();
    }, []);

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
            setUserAvatarUrl((prevUrl) => {
                if (prevUrl) {
                    URL.revokeObjectURL(prevUrl);
                }
                return URL.createObjectURL(userAvatar);
            });

            localStorage.setItem(LocalStorage.user_data, JSON.stringify(userInfo));
            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem(LocalStorage.user_avatar, reader.result as string);
            };
            reader.readAsDataURL(userAvatar);
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
        <UserContext.Provider value={{ userInfo, userAvatar, userAvatarUrl, updateUserInfo, clearUserInfo }}>
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
        const errorMessage = "useUser must be used within a UserProvider";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return ctx;
}
