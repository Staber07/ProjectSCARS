"use client";

import {
    Anchor,
    Avatar,
    Box,
    Button,
    Divider,
    FileButton,
    Flex,
    Group,
    Modal,
    Space,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { VerifyUserEmail } from "@/lib/api/auth";
import { UploadUserAvatar } from "@/lib/api/user";
import { roles } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { notifications } from "@mantine/notifications";
import { IconMailOff, IconMailOpened } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ProfileContent() {
    const searchParams = useSearchParams();
    const userCtx = useUser();
    const [opened, { open, close }] = useDisclosure(false);

    const uploadAvatar = async (file: File | null) => {
        if (file === null) {
            console.debug("No file selected, skipping upload...");
            return;
        }
        if (userCtx.userInfo === null) {
            console.error("User info is null, cannot upload avatar.");
            return;
        }
        console.debug("Uploading avatar...");
        const updatedUserInfo = await UploadUserAvatar(userCtx.userInfo.id, file);
        userCtx.updateUserInfo(updatedUserInfo, userCtx.userPermissions, file);
        console.debug("Avatar uploaded successfully.");
    };

    console.debug("Rendering ProfilePage");

    useEffect(() => {
        const emailVerificationToken = searchParams.get("emailVerificationToken");
        if (emailVerificationToken) {
            console.debug("Email verification token found:", emailVerificationToken);
            VerifyUserEmail(emailVerificationToken)
                .then(() => {
                    notifications.show({
                        id: "email-verification-success",
                        title: "Your email has been verified",
                        message: "Thank you for verifying your email address.",
                        color: "green",
                        icon: <IconMailOpened />,
                    });
                })
                .catch((error) => {
                    if (error instanceof Error) {
                        notifications.show({
                            id: "email-verification-failure",
                            title: "Email Verification Failed",
                            message: `Failed to verify your email: ${error.message}`,
                            color: "red",
                            icon: <IconMailOff />,
                        });
                    } else {
                        notifications.show({
                            id: "email-verification-failure-unknown",
                            title: "Email Verification Failed",
                            message: "An unknown error occurred while verifying your email. Please try again later.",
                            color: "red",
                            icon: <IconMailOff />,
                        });
                    }
                });
        }
    }, [searchParams]);
    return (
        <Box mx="auto" p="lg">
            <Title order={3} mb="sm">
                Profile
            </Title>
            <Divider mb="lg" />
            <Flex justify="space-between" align="flex-start" wrap="wrap" w="100%">
                <Group gap={20}>
                    <Avatar
                        variant="light"
                        radius="lg"
                        size={100}
                        color="#258ce6"
                        src={userCtx.userAvatarUrl ? userCtx.userAvatarUrl : undefined}
                    />
                    <Stack gap={0}>
                        <Text size="sm" c="dimmed">
                            {userCtx.userInfo ? roles[userCtx.userInfo?.roleId] : "Unknown Role"}
                        </Text>
                        <Text fw={600} size="lg">
                            {userCtx.userInfo?.nameFirst}{" "}
                            {userCtx.userInfo?.nameMiddle
                                ? userCtx.userInfo?.nameMiddle
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join(".") + ". "
                                : ""}
                            {userCtx.userInfo?.nameLast}
                        </Text>
                        <Text size="sm" c="dimmed">
                            @{userCtx.userInfo?.username}
                        </Text>
                    </Stack>
                </Group>

                <FileButton onChange={uploadAvatar} accept="image/png,image/jpeg">
                    {(props) => (
                        <Button {...props} variant="outline" size="sm">
                            Edit Profile
                        </Button>
                    )}
                </FileButton>
            </Flex>

            <Divider my="lg" />

            <Title order={4} mb="sm">
                Account Security
            </Title>
            <Flex justify="space-between" align="end" w="100%" gap="lg">
                <Stack w="100%" style={{ flexGrow: 1, minWidth: 0 }}>
                    <TextInput
                        label="Email"
                        value={userCtx.userInfo?.email || ""}
                        size="sm"
                        disabled
                        w="100%"
                        style={{ flexGrow: 1, minWidth: 0 }}
                        labelProps={{ style: { marginBottom: 6 } }}
                    />
                </Stack>

                <Button
                    variant="outline"
                    size="sm"
                    style={{
                        height: 35,
                        whiteSpace: "nowrap",
                        width: 165,
                        flexShrink: 0,
                    }}
                >
                    Change email
                </Button>
            </Flex>

            <Space h="md" />

            <Flex justify="space-between" align="end" w="100%" gap="lg">
                <Stack w="100%" style={{ flexGrow: 1, minWidth: 0 }}>
                    <TextInput
                        label="Password"
                        value="********"
                        size="sm"
                        disabled
                        w="100%"
                        style={{ flexGrow: 1, minWidth: 0 }}
                        labelProps={{ style: { marginBottom: 6 } }}
                    />
                </Stack>

                <Modal opened={opened} onClose={close} title="Update Password" centered>
                    <Stack>
                        <TextInput label="Current Password" placeholder="" type="password" required />
                        <TextInput label="New Password" placeholder="At least 8 characters" type="password" required />
                        <TextInput
                            label="Confirm Password"
                            placeholder="At least 8 characters"
                            type="password"
                            required
                        />

                        <Button variant="filled" color="blue">
                            Update Password
                        </Button>

                        <Anchor
                            size="xs"
                            style={{
                                color: "gray",
                                textAlign: "center",
                                cursor: "pointer",
                            }}
                        >
                            Forgot your password?
                        </Anchor>
                    </Stack>
                </Modal>

                <Button
                    variant="outline"
                    size="sm"
                    style={{
                        height: 35,
                        whiteSpace: "nowrap",
                        width: 165,
                        flexShrink: 0,
                    }}
                    onClick={open}
                >
                    Change password
                </Button>
            </Flex>

            <Space h="md" />

            <Group justify="space-between" mt="md">
                <Box>
                    <Text fw={500} size="sm">
                        2-Step Verification
                    </Text>
                    <Text size="xs" c="dimmed">
                        Add an additional layer of security to your account during login.
                    </Text>
                </Box>

                <Switch />
            </Group>
        </Box>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<LoadingComponent message="Loading your profile..." />}>
            <ProfileContent />
        </Suspense>
    );
}
