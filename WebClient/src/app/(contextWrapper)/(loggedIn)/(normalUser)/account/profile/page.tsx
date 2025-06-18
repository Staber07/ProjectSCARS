"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { GetAllRoles, OAuthGoogleUnlink, VerifyUserEmail } from "@/lib/api/auth";
import { GetAllSchools } from "@/lib/api/school";
import { UploadUserAvatar } from "@/lib/api/user";
import { roles } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { UserPublicType } from "@/lib/types";
import {
    Anchor,
    Avatar,
    Badge,
    Box,
    Button,
    ColorInput,
    Divider,
    Flex,
    Group,
    Modal,
    Paper,
    Select,
    Space,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
    useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCircleDashedCheck,
    IconCircleDashedX,
    IconDeviceFloppy,
    IconMailOff,
    IconMailOpened,
} from "@tabler/icons-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface EditProfileValues {
    id: string;
    username: string | null;
    nameFirst: string | null;
    nameMiddle: string | null;
    nameLast: string | null;
    email: string | null;
    school: string | null;
    role: string | null;
    deactivated: boolean;
    forceUpdateInfo: boolean;
}

interface ProfileContentProps {
    userInfo: UserPublicType | null;
    userPermissions: string[] | null;
    userAvatarUrl: string | null;
}

interface UserPreferences {
    darkMode: boolean;
    accentColor: string;
    language: string;
    timezone: string;
}

function ProfileContent({ userInfo, userPermissions, userAvatarUrl }: ProfileContentProps) {
    const userCtx = useUser();
    const searchParams = useSearchParams();
    const [opened, { open, close }] = useDisclosure(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<{ value: string; label: string }[]>([]);
    const [availableSchools, setAvailableSchools] = useState<{ value: string; label: string }[]>([]);

    const form = useForm<EditProfileValues>({
        mode: "uncontrolled",
        initialValues: {
            id: userInfo?.id || "",
            username: userInfo?.username || "",
            nameFirst: userInfo?.nameFirst || "",
            nameMiddle: userInfo?.nameMiddle || "",
            nameLast: userInfo?.nameLast || "",
            email: userInfo?.email || "",
            school: "",
            role: "",
            deactivated: userInfo?.deactivated || false,
            forceUpdateInfo: userInfo?.forceUpdateInfo || false,
        },
    });

    // Update form when userInfo becomes available
    useEffect(() => {
        async function fetchData() {
            const roles = await GetAllRoles();
            const schools = await GetAllSchools(0, 999);
            setAvailableRoles(
                roles.map((role) => ({
                    value: role.id.toString(),
                    label: role.description,
                }))
            );
            setAvailableSchools(
                schools.map((school) => ({
                    value: school.id.toString(),
                    label: `[${school.id}] ${school.name}${school.address ? ` (${school.address})` : ""}`,
                }))
            );
            if (userInfo) {
                const new_values = {
                    id: userInfo.id,
                    username: userInfo.username,
                    nameFirst: userInfo.nameFirst,
                    nameMiddle: userInfo.nameMiddle,
                    nameLast: userInfo.nameLast,
                    email: userInfo.email,
                    school: schools.find((s) => s.id === userInfo.schoolId)?.name || "",
                    role: roles.find((r) => r.id === userInfo.roleId)?.description || "",
                    deactivated: userInfo.deactivated,
                    forceUpdateInfo: userInfo.forceUpdateInfo,
                };
                console.debug("Updating form values with userInfo:", new_values);
                form.setValues(new_values);
            }
        }
        fetchData();
    }, [userInfo]);

    console.debug("Profile form initialized with values:", form.values);
    const uploadAvatar = async (file: File | null) => {
        if (file === null) {
            console.debug("No file selected, skipping upload...");
            return;
        }
        if (userInfo === null) {
            console.error("User info is null, cannot upload avatar.");
            return;
        }
        console.debug("Uploading avatar...");
        const updatedUserInfo = await UploadUserAvatar(userInfo.id, file);
        userCtx.updateUserInfo(updatedUserInfo, userPermissions, file);
        console.debug("Avatar uploaded successfully.");
    };

    const handleSave = async (values: EditProfileValues) => {
        console.debug("Saving profile changes...", values);
    };

    const handleProfileEdit = () => {
        console.debug("Navigating to profile edit page...");
    };

    const { setColorScheme } = useMantineColorScheme();
    const [userPreferences, setUserPreferences] = useLocalStorage<UserPreferences>({
        key: "user-preferences",
        defaultValue: {
            darkMode: false,
            accentColor: "#228be6",
            language: "English",
            timezone: "UTC+8 (Philippines)",
        },
    });

    useEffect(() => {
        setColorScheme(userPreferences.darkMode ? "dark" : "light");
        document.documentElement.style.setProperty("--mantine-primary-color-filled", userPreferences.accentColor);
    }, [userPreferences, setColorScheme]);

    const handlePreferenceChange = (key: keyof UserPreferences, value: string | boolean | null) => {
        setUserPreferences((prev) => ({ ...prev, [key]: value }));
        notifications.show({
            title: "Preferences Updated",
            message: "Your preferences have been saved",
            color: "green",
        });
    };

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
                        src={userAvatarUrl ? userAvatarUrl : undefined}
                    />
                    <Stack gap={0}>
                        <Text size="sm" c="dimmed">
                            {userInfo ? roles[userInfo?.roleId] : "Unknown Role"}
                        </Text>
                        <Text fw={600} size="lg">
                            {userInfo?.nameFirst}{" "}
                            {userInfo?.nameMiddle
                                ? userInfo?.nameMiddle
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join(".") + ". "
                                : ""}
                            {userInfo?.nameLast}
                        </Text>
                        <Text size="sm" c="dimmed">
                            @{userInfo?.username}
                        </Text>
                    </Stack>
                </Group>
                <Button variant="outline" size="sm" onClick={handleProfileEdit}>
                    Edit Profile
                </Button>
            </Flex>

            <Divider my="lg" />

            <form
                onSubmit={form.onSubmit(handleSave)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        form.onSubmit(handleSave)();
                    }
                }}
            >
                <Title order={4} mb="sm" mt="lg">
                    Account
                </Title>
                <Tooltip
                    disabled={userPermissions?.includes("users:self:modify:username")}
                    label="Username cannot be changed"
                    withArrow
                >
                    <TextInput
                        disabled={!userPermissions?.includes("users:self:modify:username")}
                        label="Username"
                        placeholder="Username"
                        key={form.key("username")}
                        {...form.getInputProps("username")}
                    />
                </Tooltip>{" "}
                <Tooltip
                    disabled={userPermissions?.includes("users:self:modify:role")}
                    label="Role cannot be changed"
                    withArrow
                >
                    <Select
                        disabled={!userPermissions?.includes("users:self:modify:role")}
                        label="Role"
                        placeholder="Role"
                        data={availableRoles}
                        key={form.key("role")}
                        searchable
                        {...form.getInputProps("role")}
                    />
                </Tooltip>
                <Tooltip
                    disabled={userPermissions?.includes("users:self:modify:school")}
                    label="School cannot be changed"
                    withArrow
                >
                    <Select
                        disabled={!userPermissions?.includes("users:self:modify:school")}
                        label="Assigned School"
                        placeholder="School"
                        data={availableSchools}
                        key={form.key("school")}
                        searchable
                        {...form.getInputProps("school")}
                    />
                </Tooltip>
                <Group mt="md">
                    <Tooltip
                        disabled={userPermissions?.includes("users:self:deactivate")}
                        label="Deactivation status cannot be changed"
                        withArrow
                    >
                        <Switch
                            disabled={!userPermissions?.includes("users:self:deactivate")}
                            label="Deactivated"
                            placeholder="Deactivated"
                            key={form.key("deactivated")}
                            {...form.getInputProps("deactivated", { type: "checkbox" })}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userPermissions?.includes("users:self:forceupdate")}
                        label="Force Update Required cannot be changed"
                        withArrow
                    >
                        <Switch
                            disabled={!userPermissions?.includes("users:self:forceupdate")}
                            label="Force Update Required"
                            placeholder="Force Update Required"
                            key={form.key("forceUpdateInfo")}
                            {...form.getInputProps("forceUpdateInfo", { type: "checkbox" })}
                        />
                    </Tooltip>
                </Group>
                <Title order={4} mb="sm" mt="lg">
                    Personal Information
                </Title>
                <Group>
                    <Tooltip
                        disabled={userPermissions?.includes("users:self:modify:name")}
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userPermissions?.includes("users:self:modify:name")}
                            label="First Name"
                            placeholder="First Name"
                            key={form.key("nameFirst")}
                            {...form.getInputProps("nameFirst")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userPermissions?.includes("users:self:modify:name")}
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userPermissions?.includes("users:self:modify:name")}
                            label="Middle Name"
                            placeholder="Middle Name"
                            key={form.key("nameMiddle")}
                            {...form.getInputProps("nameMiddle")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userPermissions?.includes("users:self:modify:name")}
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userPermissions?.includes("users:self:modify:name")}
                            label="Last Name"
                            placeholder="Last Name"
                            key={form.key("nameLast")}
                            {...form.getInputProps("nameLast")}
                        />
                    </Tooltip>
                </Group>
                <Title order={4} mb="sm" mt="lg">
                    Account Security
                </Title>
                <Flex justify="space-between" align="end" w="100%" gap="lg">
                    <Stack w="100%" style={{ flexGrow: 1, minWidth: 0 }}>
                        <Tooltip
                            disabled={userPermissions?.includes("users:self:modify:email")}
                            label="Email cannot be changed"
                            withArrow
                        >
                            <TextInput
                                disabled={!userPermissions?.includes("users:self:modify:email")}
                                label="Email"
                                placeholder="Email"
                                rightSection={
                                    form.values.email &&
                                    (userInfo?.emailVerified && form.values.email === userInfo?.email ? (
                                        <Tooltip
                                            label="This email has been verified. You're good to go!"
                                            withArrow
                                            multiline
                                            w={250}
                                        >
                                            <IconCircleDashedCheck size={16} color="green" />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            label="This email has not yet been verified."
                                            withArrow
                                            multiline
                                            w={250}
                                        >
                                            <IconCircleDashedX size={16} color="gray" />
                                        </Tooltip>
                                    ))
                                }
                                key={form.key("email")}
                                {...form.getInputProps("email")}
                            />
                        </Tooltip>{" "}
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
                            <TextInput
                                label="New Password"
                                placeholder="At least 8 characters"
                                type="password"
                                required
                            />
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
                                href="/forgotPassword"
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
                <Divider my="lg" label="Linked Accounts" labelPosition="center" />
                <Stack>
                    <Group justify="space-between" align="center">
                        <Group>
                            <Box w={30} h={30}>
                                <Image
                                    src="/assets/logos/google.svg"
                                    alt="Google Logo"
                                    width={30}
                                    height={30}
                                    style={{ objectFit: "contain" }}
                                />
                            </Box>
                            <div>
                                <Group>
                                    <Text size="sm" fw={500}>
                                        Google
                                    </Text>
                                    <Badge
                                        variant="filled"
                                        color={userInfo?.oauthLinkedGoogleId ? "green" : "gray"}
                                        size="xs"
                                    >
                                        {userInfo?.oauthLinkedGoogleId ? "Linked" : "Not Linked"}
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Link your Google account for quick sign-in
                                </Text>
                            </div>
                        </Group>
                        {userInfo?.oauthLinkedGoogleId ? (
                            <Button
                                variant="light"
                                color="red"
                                size="xs"
                                onClick={async () => {
                                    try {
                                        await OAuthGoogleUnlink();
                                    } catch {
                                        notifications.show({
                                            title: "Unlink Failed",
                                            message: "Failed to unlink your Google account. Please try again later.",
                                            color: "red",
                                        });
                                        return;
                                    }
                                    notifications.show({
                                        title: "Unlink Successful",
                                        message: "Your Google account has been unlinked successfully.",
                                        color: "green",
                                    });
                                }}
                            >
                                Unlink Account
                            </Button>
                        ) : (
                            <Button
                                variant="light"
                                color="red"
                                size="xs"
                                onClick={async () => {
                                    const response = await fetch("http://localhost:8081/v1/auth/oauth/google/login");
                                    const data = await response.json();
                                    if (data.url) {
                                        window.location.href = data.url;
                                    }
                                }}
                            >
                                Link Account
                            </Button>
                        )}
                    </Group>

                    <Group justify="space-between" align="center">
                        <Group>
                            <Box w={30} h={30}>
                                <Image
                                    src="/assets/logos/facebook.svg"
                                    alt="Facebook Logo"
                                    width={30}
                                    height={30}
                                    style={{ objectFit: "contain" }}
                                />
                            </Box>
                            <div>
                                <Group>
                                    <Text size="sm" fw={500}>
                                        Facebook
                                    </Text>
                                    <Badge
                                        variant="filled"
                                        color={userInfo?.oauthLinkedFacebookId ? "green" : "gray"}
                                        size="xs"
                                    >
                                        {userInfo?.oauthLinkedFacebookId ? "Linked" : "Not Linked"}
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Link your Facebook account for quick sign-in
                                </Text>
                            </div>
                        </Group>
                        <Button
                            disabled={userInfo?.oauthLinkedFacebookId !== null}
                            variant="light"
                            color="blue"
                            size="xs"
                            onClick={() => {
                                notifications.show({
                                    title: "Coming Soon",
                                    message: "Facebook account linking will be available soon",
                                    color: "blue",
                                });
                            }}
                        >
                            Link Account
                        </Button>
                    </Group>

                    <Group justify="space-between" align="center">
                        <Group>
                            <Box w={30} h={30}>
                                <Image
                                    src="/assets/logos/microsoft.svg"
                                    alt="Microsoft Logo"
                                    width={30}
                                    height={30}
                                    style={{ objectFit: "contain" }}
                                />
                            </Box>
                            <div>
                                <Group>
                                    <Text size="sm" fw={500}>
                                        Microsoft
                                    </Text>
                                    <Badge
                                        variant="filled"
                                        color={userInfo?.oauthLinkedMicrosoftId ? "green" : "gray"}
                                        size="xs"
                                    >
                                        {userInfo?.oauthLinkedMicrosoftId ? "Linked" : "Not Linked"}
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Link your Microsoft account for quick sign-in
                                </Text>
                            </div>
                        </Group>
                        <Button
                            disabled={userInfo?.oauthLinkedMicrosoftId !== null}
                            variant="light"
                            color="indigo"
                            size="xs"
                            onClick={() => {
                                notifications.show({
                                    title: "Coming Soon",
                                    message: "Microsoft account linking will be available soon",
                                    color: "blue",
                                });
                            }}
                        >
                            Link Account
                        </Button>
                    </Group>
                </Stack>
                <Button loading={buttonLoading} rightSection={<IconDeviceFloppy />} type="submit" fullWidth mt="xl">
                    Save
                </Button>
            </form>

            <Paper shadow="sm" p="md" radius="md" mt="xl">
                <Title order={4} mb="xs">
                    Personal Preferences
                </Title>
                <Stack>
                    <Switch
                        label="Dark Mode"
                        checked={userPreferences.darkMode}
                        onChange={(e) => handlePreferenceChange("darkMode", e.currentTarget.checked)}
                    />
                    <ColorInput
                        label="Accent Color"
                        value={userPreferences.accentColor}
                        onChange={(color) => handlePreferenceChange("accentColor", color)}
                    />
                    <Select
                        label="Default Language"
                        data={[
                            { value: "en", label: "English" },
                            { value: "tl", label: "Tagalog" },
                            { value: "ceb", label: "Cebuano" },
                            { value: "fil", label: "Filipino" },
                        ]}
                        value={userPreferences.language}
                        onChange={(value) => handlePreferenceChange("language", value)}
                    />
                    <Select
                        label="Timezone"
                        data={[
                            { value: "Asia/Manila", label: "GMT+8 (Philippines)" },
                            { value: "Asia/Singapore", label: "GMT+8 (Singapore)" },
                            { value: "Asia/Hong_Kong", label: "GMT+8 (Hong Kong)" },
                            { value: "Asia/Taipei", label: "GMT+8 (Taipei)" },
                        ]}
                        value={userPreferences.timezone}
                        onChange={(value) => handlePreferenceChange("timezone", value)}
                    />
                </Stack>
            </Paper>
        </Box>
    );
}

export default function ProfilePage() {
    const userCtx = useUser();
    return (
        <Suspense fallback={<LoadingComponent message="Loading your profile..." withBorder={false} />}>
            <ProfileContent
                userInfo={userCtx.userInfo}
                userPermissions={userCtx.userPermissions}
                userAvatarUrl={userCtx.userAvatarUrl}
            />
        </Suspense>
    );
}
