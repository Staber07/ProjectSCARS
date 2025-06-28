import { LocalStorage } from "@/lib/info";
import { UserPublicType } from "@/lib/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { UserPublic } from "@/lib/api/csclient";

interface UserContextType {
    userInfo: UserPublicType | null;
    userPermissions: string[] | null;
    userAvatar: Blob | null;
    userAvatarUrl: string | null;
    updateUserInfo: (userInfo: UserPublic, permissions: string[] | null, userAvatar?: Blob | null) => void;
    clearUserInfo: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: UserProviderProps): ReactNode {
    const [userInfo, setUserInfo] = useState<UserPublicType | null>(null);
    const [userPermissions, setUserPermissions] = useState<string[] | null>(null);
    const [userAvatar, setUserAvatar] = useState<Blob | null>(null);
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const storedUserInfo = localStorage.getItem(LocalStorage.userData);
            const storedUserPermissions = localStorage.getItem(LocalStorage.userPermissions);
            const storedUserAvatar = localStorage.getItem(LocalStorage.userAvatar);
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
            }
            if (storedUserPermissions) {
                setUserPermissions(JSON.parse(storedUserPermissions));
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
     * @param {string[]} permissions - The permissions of the user.
     * @param {Blob | null} userAvatar - The user avatar to set, if available.
     */
    const updateUserInfo = (userInfo: UserPublicType, permissions?: string[] | null, userAvatar?: Blob | null) => {
        console.debug("Setting user info", { userInfo, permissions, userAvatar });
        setUserInfo(userInfo);
        localStorage.setItem(LocalStorage.userData, JSON.stringify(userInfo));

        // Update permissions and avatar only if they are provided
        if (permissions) {
            setUserPermissions(permissions);
            localStorage.setItem(LocalStorage.userPermissions, JSON.stringify(permissions));
        } else {
            setUserPermissions(null);
            localStorage.removeItem(LocalStorage.userPermissions);
        }

        if (userAvatar) {
            setUserAvatar(userAvatar);
            setUserAvatarUrl((prevUrl) => {
                if (prevUrl) {
                    URL.revokeObjectURL(prevUrl);
                }
                return URL.createObjectURL(userAvatar);
            });
            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem(LocalStorage.userAvatar, reader.result as string);
            };
            reader.readAsDataURL(userAvatar);
        } else {
            setUserAvatar(null);
            setUserAvatarUrl(null);
            localStorage.removeItem(LocalStorage.userAvatar);
        }
    };

    /**
     * Clear the user information and avatar.
     */
    const clearUserInfo = () => {
        setUserInfo(null);
        setUserPermissions(null);
        setUserAvatar(null);
    };

    return (
        <UserContext.Provider
            value={{
                userInfo,
                userPermissions,
                userAvatar,
                userAvatarUrl,
                updateUserInfo,
                clearUserInfo,
            }}
        >
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
