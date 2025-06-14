"use client";

import { ErrorComponent } from "@/components/ErrorComponent";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { MainLoginComponent } from "@/components/MainLoginComponent/MainLoginComponent";
import { GetUserInfo, OAuthGoogleAuthenticate } from "@/lib/api/auth";
import { GetUserAvatar } from "@/lib/api/user";
import { useAuth } from "@/lib/providers/auth";
import { useUser } from "@/lib/providers/user";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OAuthGooglePage() {
    const authCtx = useAuth();
    const userCtx = useUser();
    const router = useRouter();
    const params = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [isLoading, handlers] = useDisclosure(true);

    console.debug("Rendering OAuthGooglePage");
    useEffect(() => {
        const handleOAuth = async () => {
            console.debug("OAuthGooglePage useEffect started");
            const code = params.get("code");
            if (!code) {
                console.error("No authorization code found in query parameters.");
                handlers.close();
                return;
            }
            console.debug("Authorization code found:", code);
            try {
                const tokens = await OAuthGoogleAuthenticate(code);
                authCtx.login(tokens);

                const [userInfo, userPermissions] = await GetUserInfo();
                console.debug("User info fetched successfully", { id: userInfo.id, username: userInfo.username });
                let userAvatar: Blob | null = null;
                if (userInfo.avatarUrn) {
                    userAvatar = await GetUserAvatar(userInfo.avatarUrn);
                    if (userAvatar) {
                        console.debug("User avatar fetched successfully", { size: userAvatar.size });
                    } else {
                        console.warn("No avatar found for user, using default avatar.");
                    }
                }
                userCtx.updateUserInfo(userInfo, userPermissions, userAvatar);
                notifications.show({
                    id: "login-success",
                    title: "Login successful",
                    message: "You are now logged in.",
                    color: "green",
                    icon: <IconCheck />,
                });
                router.push("/dashboard");
            } catch (error) {
                if (error instanceof Error) {
                    notifications.show({
                        id: "google-login-failed",
                        title: "Google login failed",
                        message: error.message,
                        color: "red",
                        icon: <IconX />,
                    });
                } else {
                    console.error("Error logging in:", error);
                    notifications.show({
                        id: "login-error",
                        title: "Login failed",
                        message: `${error}`,
                        color: "red",
                        icon: <IconX />,
                    });
                }
                handlers.close();
            }
            setSuccess(true);
        };

        handleOAuth();
    }, [router, handlers, params, authCtx, userCtx]);

    return (
        <>
            {isLoading && <LoadingComponent withBorder={false} />} {!isLoading && success && <MainLoginComponent />}{" "}
            {!isLoading && !success && (
                <ErrorComponent
                    error={new Error("Failed to authenticate with Google. Please try again later.")}
                    reset={() => router.push("/login")}
                />
            )}
        </>
    );
}
