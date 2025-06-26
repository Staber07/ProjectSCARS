"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import {
    DisableTOTP,
    GenerateTOTP,
    GetAllRoles,
    GetOAuthSupport,
    GetUserInfo,
    OAuthGoogleUnlink,
    RequestVerificationEmail,
    VerifyTOTP,
    VerifyUserEmail,
} from "@/lib/api/auth";
import { GetAllSchools } from "@/lib/api/school";
import { GetUserAvatar, RemoveUserProfile, UpdateUserInfo, UploadUserAvatar } from "@/lib/api/user";
import { LocalStorage, userAvatarConfig } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { OTPGenDataType, UserPreferences, UserPublicType, UserUpdateType } from "@/lib/types";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Badge,
    Box,
    Button,
    Center,
    ColorInput,
    Divider,
    FileButton,
    Flex,
    Group,
    Modal,
    Paper,
    PinInput,
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
    IconClipboardCopy,
    IconDeviceFloppy,
    IconKey,
    IconMail,
    IconMailOff,
    IconMailOpened,
    IconPencilCheck,
    IconSendOff,
    IconUserExclamation,
    IconX,
} from "@tabler/icons-react";
import { useQRCode } from "next-qrcode";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface EditProfileValues {
    id: string;
    username: string | undefined;
    nameFirst: string | undefined;
    nameMiddle: string | undefined;
    nameLast: string | undefined;
    position: string | undefined;
    email: string | undefined;
    school: string | undefined;
    role: string | undefined;
    deactivated: boolean;
    forceUpdateInfo: boolean;
}

interface ProfileContentProps {
    userInfo: UserPublicType | null;
    userPermissions: string[] | null;
    userAvatarUrl: string | null;
}

function ProfileContent({ userInfo, userPermissions, userAvatarUrl }: ProfileContentProps) {
    const searchParams = useSearchParams();
    const userCtx = useUser();
    const { SVG } = useQRCode();
    const { setColorScheme, colorScheme } = useMantineColorScheme();
    const [userPreferences, setUserPreferences] = useLocalStorage<UserPreferences>({
        key: LocalStorage.userPreferences,
        defaultValue: {
            accentColor: "#228be6",
            language: "English",
            timezone: "UTC+8 (Philippines)",
        },
    });
    const form = useForm<EditProfileValues>({ mode: "uncontrolled" });

    const [opened, modalHandler] = useDisclosure(false);
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const [otpEnabled, setOtpEnabled] = useState(false);
    const [otpGenData, setOtpGenData] = useState<OTPGenDataType | null>(null);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showOTPSecret, showOTPSecretHandler] = useDisclosure(false);
    const [showRecoveryCodeModal, setShowRecoveryCodeModal] = useState(false);
    const [verifyOtpCode, setVerifyOtpCode] = useState("");
    const [otpVerifyHasError, setOtpVerifyHasError] = useState(false);
    const [currentAvatarUrn, setCurrentAvatarUrn] = useState<string | null>(null);
    const [editUserAvatar, setEditUserAvatar] = useState<File | null>(null);
    const [editUserAvatarUrl, setEditUserAvatarUrl] = useState<string | null>(userAvatarUrl);
    const [avatarRemoved, setAvatarRemoved] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [availableSchools, setAvailableSchools] = useState<string[]>([]);
    const [oauthSupport, setOAuthSupport] = useState<{ google: boolean; microsoft: boolean; facebook: boolean }>({
        google: false,
        // TODO: OAuth adapters below are not implemented yet.
        microsoft: false,
        facebook: false,
    });

    const SetSelectValue = async (value: string, s: string) => {
        // set x in string "[x] y"
        return `[${value}] ${s}`;
    };

    const GetSelectValue = async (s: string | undefined) => {
        // get x in string "[x] y"
        return s ? s.split("]")[0].replace(/\[/g, "") : null;
    };

    const fetchUserAvatar = async (avatarUrn: string): Promise<string | undefined> => {
        try {
            const blob = await GetUserAvatar(avatarUrn);
            const url = URL.createObjectURL(blob);
            if (avatarUrn && !currentAvatarUrn) URL.revokeObjectURL(avatarUrn);
            setCurrentAvatarUrn(avatarUrn);
            return url;
        } catch (error) {
            console.error("Failed to fetch user avatar:", error);
            notifications.show({
                id: "fetch-user-avatar-error",
                title: "Error",
                message: "Failed to fetch user avatar.",
                color: "red",
                icon: <IconUserExclamation />,
            });
            return undefined;
        }
    };

    const handlePreferenceChange = (key: keyof UserPreferences, value: string | boolean | null) => {
        setUserPreferences((prev) => ({ ...prev, [key]: value }));
        notifications.show({
            title: "Preferences Updated",
            message: "Your preferences have been saved",
            color: "green",
        });
    };
    const handleChangeAvatar = async (file: File | null) => {
        if (file === null) {
            console.debug("No file selected, skipping upload...");
            return;
        }
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > userAvatarConfig.MAX_FILE_SIZE_MB) {
            notifications.show({
                id: "file-too-large",
                title: "File Too Large",
                message: `File size ${fileSizeMB.toFixed(2)} MB exceeds the 2 MB limit.`,
                color: "red",
                icon: <IconSendOff />,
            });
            return;
        }
        if (!userAvatarConfig.ALLOWED_FILE_TYPES.includes(file.type)) {
            notifications.show({
                id: "invalid-file-type",
                title: "Invalid File Type",
                message: `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WEBP.`,
                color: "red",
                icon: <IconSendOff />,
            });
            return;
        }

        setAvatarRemoved(false);
        setEditUserAvatar(file);
        setEditUserAvatarUrl((prevUrl) => {
            if (prevUrl && !currentAvatarUrn) {
                URL.revokeObjectURL(prevUrl); // Clean up previous URL
            }
            return URL.createObjectURL(file); // Create a new URL for the selected file
        });
    };
    const handleSave = async (values: EditProfileValues) => {
        buttonStateHandler.open();
        // NOTE: Only update fields that have changed
        // console.debug("values:", values);
        // console.debug("userInfo:", userInfo);
        // Resolve async operations first
        const schoolId = await GetSelectValue(values.school);
        const roleId = await GetSelectValue(values.role);
        const newUserInfo: UserUpdateType = {
            id: values.id,
            username: values.username !== userInfo?.username && values.username ? values.username : undefined,
            nameFirst: values.nameFirst !== userInfo?.nameFirst && values.nameFirst ? values.nameFirst : undefined,
            nameMiddle: values.nameMiddle !== userInfo?.nameMiddle && values.nameMiddle ? values.nameMiddle : undefined,
            nameLast: values.nameLast !== userInfo?.nameLast && values.nameLast ? values.nameLast : undefined,
            position: values.position !== userInfo?.position && values.position ? values.position : undefined,
            email: values.email !== userInfo?.email && values.email ? values.email : undefined,
            schoolId: Number(schoolId) !== userInfo?.schoolId && schoolId ? Number(schoolId) : null,
            roleId: Number(roleId) !== userInfo?.roleId && roleId ? Number(roleId) : null,
            deactivated: values.deactivated !== userInfo?.deactivated ? values.deactivated : undefined,
            forceUpdateInfo: values.forceUpdateInfo !== userInfo?.forceUpdateInfo ? values.forceUpdateInfo : undefined,
            finishedTutorials: null,
            password: null,
        };
        try {
            let updatedUser = await UpdateUserInfo(newUserInfo);
            notifications.show({
                id: "user-update-success",
                title: "Success",
                message: "User information updated successfully.",
                color: "green",
                icon: <IconPencilCheck />,
            });

            if (avatarRemoved && currentAvatarUrn) {
                try {
                    console.debug("Removing avatar...");
                    await RemoveUserProfile(values.id);
                    console.debug("Avatar removed successfully.");
                    notifications.show({
                        id: "avatar-remove-success",
                        title: "Success",
                        message: "Avatar removed successfully.",
                        color: "green",
                        icon: <IconPencilCheck />,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        const detail = error.message || "Failed to remove avatar.";
                        console.error("Avatar removal failed:", detail);
                        notifications.show({
                            id: "avatar-remove-error",
                            title: "Avatar Removal Failed",
                            message: detail,
                            color: "red",
                            icon: <IconSendOff />,
                        });
                    }
                }
            }
            if (editUserAvatar) {
                try {
                    console.debug("Uploading avatar...");
                    updatedUser = await UploadUserAvatar(values.id, editUserAvatar);
                    if (updatedUser.avatarUrn) {
                        fetchUserAvatar(updatedUser.avatarUrn);
                        console.debug("Avatar uploaded successfully.");
                        notifications.show({
                            id: "avatar-upload-success",
                            title: "Success",
                            message: "Avatar uploaded successfully.",
                            color: "green",
                            icon: <IconPencilCheck />,
                        });
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        const detail = error.message || "Failed to upload avatar.";
                        console.error("Avatar upload failed:", detail);
                        notifications.show({
                            id: "avatar-upload-error",
                            title: "Avatar Upload Failed",
                            message: detail,
                            color: "red",
                            icon: <IconSendOff />,
                        });
                        buttonStateHandler.close();
                        throw new Error(detail);
                    }
                    buttonStateHandler.close();
                }
            }
            if (updatedUser.avatarUrn && updatedUser.avatarUrn.trim() !== "" && !avatarRemoved) {
                const newAvatarUrl = await fetchUserAvatar(updatedUser.avatarUrn);
                if (newAvatarUrl) {
                    setEditUserAvatarUrl(newAvatarUrl);
                }
            } else if (avatarRemoved) {
                setEditUserAvatarUrl(null);
            }

            // Reset temporary states after successful save
            setEditUserAvatar(null);
            setAvatarRemoved(false);
        } catch (error) {
            if (error instanceof Error && error.message.includes("status code 403")) {
                const detail = error.message || "Failed to update user information.";
                notifications.show({
                    id: "user-update-error",
                    title: "Error",
                    message: detail,
                    color: "red",
                    icon: <IconSendOff />,
                });
            }
            console.error("Update process failed:", error);
            notifications.show({
                id: "user-update-error",
                title: "Error",
                message: (error as Error).message || "Failed to update user information. Please try again later.",
                color: "red",
                icon: <IconSendOff />,
            });
        } finally {
            const updatedUserInfo = await GetUserInfo();
            userCtx.updateUserInfo(updatedUserInfo[0], updatedUserInfo[1], editUserAvatar);
            buttonStateHandler.close();
        }
    };

    useEffect(() => {
        if (userInfo) {
            setOtpEnabled(userInfo.otpVerified);
            const new_values = {
                id: userInfo.id,
                username: userInfo.username || "",
                nameFirst: userInfo.nameFirst || "",
                nameMiddle: userInfo.nameMiddle || "",
                nameLast: userInfo.nameLast || "",
                position: userInfo.position || "",
                email: userInfo.email || "",
                school: availableSchools.find((school) => school.startsWith(`[${userInfo.schoolId}]`)),
                role: availableRoles.find((role) => role.startsWith(`[${userInfo.roleId}]`)),
                deactivated: userInfo.deactivated,
                forceUpdateInfo: userInfo.forceUpdateInfo,
            };
            console.debug("Setting form values:", new_values);
            form.setValues(new_values);
        }
    }, [userInfo, availableRoles, availableSchools]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Fetch available roles and schools
        const fetchRolesAndSchools = async () => {
            try {
                const rolesData = await GetAllRoles();
                const formattedRoles = await Promise.all(
                    rolesData.map((role) => SetSelectValue(role.id.toString(), role.description))
                );
                setAvailableRoles(formattedRoles);
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            }

            try {
                const schoolsData = await GetAllSchools(0, 999);
                const formattedSchools = await Promise.all(
                    schoolsData.map((school) => SetSelectValue(school.id.toString(), school.name))
                );
                setAvailableSchools(formattedSchools);
            } catch (error) {
                console.error("Failed to fetch schools:", error);
            }
        };

        fetchRolesAndSchools();
    }, []);

    useEffect(() => {
        console.debug("MainLoginComponent mounted, checking OAuth support");
        // Check if OAuth is supported by the server
        GetOAuthSupport()
            .then((response) => {
                console.debug("OAuth support response:", response);
                if (response) {
                    setOAuthSupport({
                        google: response.google,
                        microsoft: response.microsoft,
                        facebook: response.facebook,
                    });
                    console.info("OAuth support updated", response);
                } else {
                    console.warn("No OAuth support information received from server.");
                    notifications.show({
                        id: "oauth-support-error",
                        title: "OAuth Support Error",
                        message: "Could not retrieve OAuth support information from the server.",
                        color: "yellow",
                        icon: <IconX />,
                    });
                }
            })
            .catch((error) => {
                console.error("Error fetching OAuth support:", error);
                notifications.show({
                    id: "oauth-support-fetch-error",
                    title: "OAuth Support Fetch Error",
                    message: "Failed to fetch OAuth support information.",
                    color: "red",
                    icon: <IconX />,
                });
            });
    }, []);

    // Check if email verification token is present in the URL and verify it
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
                        src={editUserAvatarUrl || userAvatarUrl || undefined}
                    />
                    <Stack gap={0}>
                        <Text size="sm" c="dimmed">
                            {userInfo && userInfo.position ? userInfo.position : "No Assigned Position"}
                        </Text>
                        <Text fw={600} size="lg">
                            {userInfo?.nameFirst || userInfo?.nameMiddle || userInfo?.nameLast
                                ? `${userInfo?.nameFirst ?? ""} ${
                                      userInfo?.nameMiddle
                                          ? userInfo.nameMiddle
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join(".") + ". "
                                          : ""
                                  }${userInfo?.nameLast ?? ""}`.trim()
                                : "Unnamed User"}
                        </Text>
                        <Text size="sm" c="dimmed">
                            @{userInfo?.username}
                        </Text>
                    </Stack>
                </Group>
                <FileButton onChange={handleChangeAvatar} accept="image/png,image/jpeg">
                    {(props) => (
                        <Button variant="outline" size="sm" {...props}>
                            Change Profile Picture
                        </Button>
                    )}
                </FileButton>
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
                                            label="This email has not yet been verified. Click to send a verification email."
                                            withArrow
                                            multiline
                                            w={250}
                                            onClick={() => {
                                                try {
                                                    RequestVerificationEmail();
                                                    notifications.show({
                                                        id: "verification-email-sent",
                                                        title: "Verification Email Sent",
                                                        message:
                                                            "Please check your email and click the link to verify your email.",
                                                        color: "blue",
                                                        icon: <IconMail />,
                                                    });
                                                } catch (error) {
                                                    if (error instanceof Error) {
                                                        notifications.show({
                                                            id: "verification-email-error",
                                                            title: "Error",
                                                            message: `Failed to send verification email: ${error.message}`,
                                                            color: "red",
                                                            icon: <IconSendOff />,
                                                        });
                                                    } else {
                                                        notifications.show({
                                                            id: "verification-email-error-unknown",
                                                            title: "Error",
                                                            message:
                                                                "Failed to send verification email. Please try again later.",
                                                            color: "red",
                                                            icon: <IconSendOff />,
                                                        });
                                                    }
                                                }
                                            }}
                                        >
                                            <IconCircleDashedX size={16} color="gray" />
                                        </Tooltip>
                                    ))
                                }
                                key={form.key("email")}
                                {...form.getInputProps("email")}
                            />
                        </Tooltip>
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
                    <Modal opened={opened} onClose={modalHandler.close} title="Update Password" centered>
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
                        onClick={modalHandler.open}
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
                    <Switch
                        checked={otpEnabled}
                        onChange={async (e) => {
                            try {
                                if (e.currentTarget.checked) {
                                    if (userInfo?.otpVerified) {
                                        notifications.show({
                                            title: "Two-Step Verification Already Enabled",
                                            message: "You have already enabled two-step verification.",
                                            color: "yellow",
                                            icon: <IconKey />,
                                        });
                                        return;
                                    }
                                    const otpData = await GenerateTOTP();
                                    setOtpGenData(otpData);
                                    setShowOTPModal(true);
                                } else {
                                    await DisableTOTP().then(() => {
                                        notifications.show({
                                            title: "Two-Step Verification Disabled",
                                            message:
                                                "You will no longer be prompted for a verification code during login.",
                                            color: "yellow",
                                            icon: <IconKey />,
                                        });
                                        setOtpEnabled(false);
                                    });
                                }
                            } catch (error) {
                                notifications.show({
                                    title: "Error",
                                    message: error instanceof Error ? error.message : "An unknown error occurred.",
                                    color: "red",
                                    icon: <IconX />,
                                });
                                setOtpVerifyHasError(true);
                            } finally {
                                const updatedUserInfo = await GetUserInfo();
                                userCtx.updateUserInfo(updatedUserInfo[0], updatedUserInfo[1]);
                            }
                        }}
                    />
                </Group>
                <Modal
                    opened={showOTPModal}
                    onClose={() => {
                        showOTPSecretHandler.close();
                        setShowOTPModal(false);
                    }}
                    title="Enable Two-Step Verification"
                    centered
                >
                    <Stack>
                        <Text size="sm" c="dimmed" ta="center">
                            Scan the QR code below with your authenticator app to set up two-step verification.
                        </Text>
                        <Box style={{ textAlign: "center" }}>
                            <SVG text={otpGenData?.provisioning_uri || ""} />
                        </Box>
                        {!showOTPSecret && (
                            <Anchor
                                size="xs"
                                c="dimmed"
                                onClick={showOTPSecretHandler.open}
                                style={{ cursor: "pointer", textAlign: "center" }}
                            >
                                Can&apos;t scan the QR code?
                            </Anchor>
                        )}
                        {showOTPSecret && (
                            <Anchor
                                size="xs"
                                c="dimmed"
                                onClick={() => {
                                    if (otpGenData?.secret) {
                                        navigator.clipboard.writeText(otpGenData.secret);
                                        // showOTPSecretHandler.close();
                                        notifications.show({
                                            title: "Secret Copied",
                                            message: "The secret key has been copied to your clipboard",
                                            color: "green",
                                        });
                                    }
                                }}
                                style={{ cursor: "pointer", textAlign: "center" }}
                            >
                                <strong>{otpGenData?.secret.match(/.{1,4}/g)?.join(" ") || "Error"}</strong>
                            </Anchor>
                        )}
                        <Text size="sm" ta="center">
                            Enter the verification code generated by your authenticator app below to complete the setup.
                        </Text>
                        <Center>
                            <PinInput
                                oneTimeCode
                                length={6}
                                type="number"
                                onChange={(value) => {
                                    setVerifyOtpCode(value);
                                    setOtpVerifyHasError(false);
                                }}
                                error={otpVerifyHasError}
                            />
                        </Center>
                        <Button
                            variant="filled"
                            color="blue"
                            onClick={async () => {
                                try {
                                    await VerifyTOTP(verifyOtpCode).then(() => {
                                        notifications.show({
                                            title: "Two-Step Verification Enabled",
                                            message: "You will now be prompted for a verification code during login.",
                                            color: "green",
                                            icon: <IconKey />,
                                        });
                                        setOtpEnabled(true);
                                        setShowOTPModal(false);
                                        setShowRecoveryCodeModal(true);
                                    });
                                } catch (error) {
                                    notifications.show({
                                        title: "Error Enabling Two-Step Verification",
                                        message: error instanceof Error ? error.message : "An unknown error occurred.",
                                        color: "red",
                                        icon: <IconX />,
                                    });
                                    setOtpVerifyHasError(true);
                                } finally {
                                    showOTPSecretHandler.close();
                                }
                            }}
                        >
                            Enable Two-Step Verification
                        </Button>
                    </Stack>
                </Modal>
                <Modal
                    opened={showRecoveryCodeModal}
                    onClose={() => setShowRecoveryCodeModal(false)}
                    title="Recovery Code"
                    centered
                >
                    <Stack>
                        <Text size="sm" c="dimmed" ta="center">
                            Store this recovery code in a safe place. They can be used to access your account if you
                            lose access to your authenticator app.
                        </Text>
                        <Group justify="center" gap="sm">
                            <Flex justify="center" align="center" gap="xs">
                                {otpGenData?.recovery_code ? (
                                    <Text size="md" fw={500}>
                                        {otpGenData.recovery_code}
                                    </Text>
                                ) : (
                                    <Text size="md" c="red">
                                        No recovery code available
                                    </Text>
                                )}
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={() => {
                                        navigator.clipboard.writeText(otpGenData?.recovery_code || "");
                                        notifications.show({
                                            title: "Recovery Codes Copied",
                                            message: "The recovery codes have been copied to your clipboard",
                                            color: "green",
                                        });
                                    }}
                                >
                                    <IconClipboardCopy size={16} />
                                </ActionIcon>
                            </Flex>
                        </Group>
                    </Stack>
                </Modal>
                <Button loading={buttonLoading} rightSection={<IconDeviceFloppy />} type="submit" fullWidth mt="xl">
                    Save
                </Button>
            </form>
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
                            disabled={!oauthSupport.google}
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
                            disabled={!oauthSupport.google}
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
                    {userInfo?.oauthLinkedMicrosoftId ? (
                        <Button
                            variant="light"
                            color="blue"
                            size="xs"
                            disabled={!oauthSupport.facebook}
                            onClick={() => {
                                notifications.show({
                                    title: "Coming Soon",
                                    message: "Facebook account linking will be available soon",
                                    color: "blue",
                                });
                            }}
                        >
                            Unlink Account
                        </Button>
                    ) : (
                        <Button
                            variant="light"
                            color="blue"
                            size="xs"
                            disabled={!oauthSupport.facebook}
                            onClick={async () => {
                                notifications.show({
                                    title: "Coming Soon",
                                    message: "Facebook account linking will be available soon",
                                    color: "blue",
                                });
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
                    {userInfo?.oauthLinkedFacebookId ? (
                        <Button
                            variant="light"
                            color="indigo"
                            size="xs"
                            disabled={!oauthSupport.facebook}
                            onClick={() => {
                                notifications.show({
                                    title: "Coming Soon",
                                    message: "Microsoft account unlinking will be available soon",
                                    color: "blue",
                                });
                            }}
                        >
                            Unlink Account
                        </Button>
                    ) : (
                        <Button
                            variant="light"
                            color="indigo"
                            size="xs"
                            disabled={!oauthSupport.facebook}
                            onClick={async () => {
                                notifications.show({
                                    title: "Coming Soon",
                                    message: "Microsoft account linking will be available soon",
                                    color: "blue",
                                });
                            }}
                        >
                            Link Account
                        </Button>
                    )}
                </Group>
            </Stack>

            <Paper shadow="sm" p="md" radius="md" mt="xl">
                <Title order={4} mb="xs">
                    Personal Preferences
                </Title>
                <Stack>
                    <Switch
                        label="Dark Mode"
                        checked={colorScheme === "dark"}
                        onChange={(e) => setColorScheme(e.currentTarget.checked ? "dark" : "light")}
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
                            { value: "fil", label: "Filipino" },
                        ]}
                        value={userPreferences.language}
                        onChange={(value) => handlePreferenceChange("language", value)}
                    />
                    <Select
                        label="Timezone"
                        data={[
                            { value: "Asia/Manila", label: "Asia/Manila" },
                            { value: "Asia/Singapore", label: "Asia/Singapore" },
                            { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong" },
                            { value: "Asia/Taipei", label: "Asia/Taipei" },
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
