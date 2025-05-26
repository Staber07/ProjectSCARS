"use client";

import { useEffect, useState } from "react";
import { Avatar, Container, Group, Title } from "@mantine/core";
import { CentralServerGetUserInfo } from "@/lib/api/auth";
import { UserPublicType } from "@/lib/types";
import { CentralServerGetUserAvatar } from "@/lib/api/user";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { SpotlightComponent } from "@/components/SpotlightComponent";

export default function DashboardPage() {
    const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserPublicType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchUserInfo = async () => {
        console.debug("Fetching user info");
        setUserInfo(await CentralServerGetUserInfo());
        setIsLoading(false);
    };

    useEffect(() => {
        console.debug("DashboardPage useEffect started");
        fetchUserInfo();
        const getUserInfo = async () => {
            console.debug("Getting user info...");
            const _userInfo = await CentralServerGetUserInfo();
            setUserInfo(_userInfo);
            console.debug("Getting user avatar...");
            const userAvatarImage = await CentralServerGetUserAvatar();
            if (userAvatarImage !== null) {
                console.debug("Setting avatar blob URL...");
                setAvatarBlobUrl((prevUrl) => {
                    if (prevUrl) {
                        URL.revokeObjectURL(prevUrl);
                    }
                    return URL.createObjectURL(userAvatarImage);
                });
            } else {
                console.debug("User avatar is null, skipping....");
            }
        };
        getUserInfo();

        return () => {
            console.debug("Cleaning up avatar blob URL...");
            setAvatarBlobUrl((prevUrl) => {
                if (prevUrl) {
                    URL.revokeObjectURL(prevUrl);
                }
                return null;
            });
        };
    }, []);

    console.debug("Rendering DashboardPage");
    if (isLoading) {
        return <LoadingComponent message="Loading data..." withBorder={false} />;
    }

    return (
        <Container>
            <SpotlightComponent />
            <Group gap={20}>
                <Avatar
                    variant="light"
                    radius="lg"
                    size={100}
                    color="#258ce6"
                    src={avatarBlobUrl ? avatarBlobUrl : undefined}
                />
                {userInfo?.nameFirst ? (
                    <Title>Welcome, {userInfo.nameFirst}!</Title>
                ) : userInfo?.username ? (
                    <Title>Welcome, {userInfo.username}!</Title>
                ) : (
                    <Title>Welcome!</Title>
                )}
            </Group>
        </Container>
    );
}
