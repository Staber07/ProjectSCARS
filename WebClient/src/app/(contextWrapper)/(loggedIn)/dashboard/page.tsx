"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { SpotlightComponent } from "@/components/SpotlightComponent";
import { useUser } from "@/lib/providers/user";
import { Avatar, Container, Group, Title } from "@mantine/core";
import { Suspense } from "react";

function DashboardContent() {
    const userCtx = useUser();

    console.debug("Rendering DashboardPage");
    return (
        <Container>
            <SpotlightComponent />
            <Group gap={20}>
                <Avatar
                    variant="light"
                    radius="lg"
                    size={100}
                    color="#258ce6"
                    src={userCtx.userAvatarUrl ? userCtx.userAvatarUrl : undefined}
                />
                {userCtx.userInfo?.nameFirst ? (
                    <Title>Welcome, {userCtx.userInfo.nameFirst}!</Title>
                ) : userCtx.userInfo?.username ? (
                    <Title>Welcome, {userCtx.userInfo.username}!</Title>
                ) : (
                    <Title>Welcome!</Title>
                )}
            </Group>
        </Container>
    );
}
export default function DashboardPage() {
    return (
        <Suspense fallback={<LoadingComponent message="Loading dashboard..." withBorder={false} />}>
            <DashboardContent />
        </Suspense>
    );
}
