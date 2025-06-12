"use client";

import { GetAllRoles } from "@/lib/api/auth";
import { GetAllSchools } from "@/lib/api/school";
import { GetUserAvatar, UpdateUserInfo } from "@/lib/api/user";
import { userAvatarConfig } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { RoleType, SchoolType, UserUpdateType } from "@/lib/types";
import {
    Button,
    Card,
    Center,
    FileButton,
    Flex,
    Group,
    Image,
    Modal,
    Select,
    Switch,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCircleDashedCheck,
    IconCircleDashedX,
    IconDeviceFloppy,
    IconPencilCheck,
    IconSendOff,
    IconUser,
    IconUserExclamation,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface EditProfileProps {
    isModalOpened: boolean;
    setIsModalOpened: (opened: boolean) => void;
}

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

export function EditProfileComponent({ isModalOpened, setIsModalOpened }: EditProfileProps) {
    const userCtx = useUser();
    const [editUserAvatar, setEditUserAvatar] = useState<File | null>(null);
    const [editUserAvatarUrl, setEditUserAvatarUrl] = useState<string | null>(null);
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const [availableSchools, setAvailableSchools] = useState<SchoolType[]>([]);
    const [availableRoles, setAvailableRoles] = useState<RoleType[]>([]);
    const [availableSchoolNames, setAvailableSchoolNames] = useState<string[]>([]);
    const [availableRoleDescriptions, setAvailableRoleDescriptions] = useState<string[]>([]);

    const form = useForm<EditProfileValues>({
        mode: "uncontrolled",
        initialValues: {
            id: userCtx.userInfo?.id || "",
            username: userCtx.userInfo?.username || null,
            nameFirst: userCtx.userInfo?.nameFirst || null,
            nameMiddle: userCtx.userInfo?.nameMiddle || null,
            nameLast: userCtx.userInfo?.nameLast || null,
            email: userCtx.userInfo?.email || null,
            school: availableSchools.find((school) => school.id === userCtx.userInfo?.schoolId)
                ? `[${availableSchools.find((school) => school.id === userCtx.userInfo?.schoolId)!.id}] ${
                      availableSchools.find((school) => school.id === userCtx.userInfo?.schoolId)!.name
                  }${
                      availableSchools.find((school) => school.id === userCtx.userInfo?.schoolId)!.address
                          ? ` (${availableSchools.find((school) => school.id === userCtx.userInfo?.schoolId)!.address})`
                          : ""
                  }`
                : null,
            role: availableRoles.find((role) => role.id === userCtx.userInfo?.roleId)?.description || null,
            deactivated: userCtx.userInfo?.deactivated || false,
            forceUpdateInfo: userCtx.userInfo?.forceUpdateInfo || false,
        },
    });

    console.debug("form initial values:", form.values);
    const setAvatar = async (file: File | null) => {
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

        setEditUserAvatar(file);
        setEditUserAvatarUrl((prevUrl) => {
            if (prevUrl) {
                URL.revokeObjectURL(prevUrl); // Clean up previous URL
            }
            return URL.createObjectURL(file); // Create a new URL for the selected file
        });
    };
    const handleSave = async (values: EditProfileValues): Promise<void> => {
        buttonStateHandler.open();
        const selectedSchool = availableSchools.find(
            (school) =>
                school.name === values.school || `[${school.id}] ${school.name} (${school.address})` === values.school
        );
        if (values.school && !selectedSchool) {
            notifications.show({
                id: "school-not-found",
                title: "Error",
                message: "Selected school not found.",
                color: "red",
                icon: <IconSendOff />,
            });
            buttonStateHandler.close();
            return;
        }

        const selectedRole = availableRoles.find((role) => role.description === values.role);
        if (!selectedRole) {
            notifications.show({
                id: "role-not-found",
                title: "Error",
                message: "Selected role not found.",
                color: "red",
                icon: <IconSendOff />,
            });
            buttonStateHandler.close();
            return;
        }

        // NOTE: Only update fields that have changed
        const newUserInfo: UserUpdateType = {
            id: values.id,
            username: values.username !== userCtx.userInfo?.username ? values.username : undefined,
            nameFirst: values.nameFirst !== userCtx.userInfo?.nameFirst ? values.nameFirst : undefined,
            nameMiddle: values.nameMiddle !== userCtx.userInfo?.nameMiddle ? values.nameMiddle : undefined,
            nameLast: values.nameLast !== userCtx.userInfo?.nameLast ? values.nameLast : undefined,
            email: values.email !== userCtx.userInfo?.email ? values.email : undefined,
            schoolId: selectedSchool?.id !== userCtx.userInfo?.schoolId ? selectedSchool?.id : undefined,
            roleId: selectedRole.id !== userCtx.userInfo?.roleId ? selectedRole.id : undefined,
            deactivated: values.deactivated !== userCtx.userInfo?.deactivated ? values.deactivated : undefined,
            forceUpdateInfo:
                values.forceUpdateInfo !== userCtx.userInfo?.forceUpdateInfo ? values.forceUpdateInfo : undefined,
            finishedTutorials: null,
            password: null,
        };
        try {
            await UpdateUserInfo(newUserInfo);
            notifications.show({
                id: "user-update-success",
                title: "Success",
                message: "User information updated successfully.",
                color: "green",
                icon: <IconPencilCheck />,
            });

            setIsModalOpened(false);
        } catch (error) {
            try {
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
                buttonStateHandler.close();
            }
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const schools = await GetAllSchools(0, 99);
                const roles = await GetAllRoles();
                setAvailableSchools(schools);
                setAvailableRoles(roles);
                setAvailableSchoolNames(
                    availableSchools.map(
                        (school) => `[${school.id}] ${school.name}${school.address ? ` (${school.address})` : ""}`
                    )
                );
                setAvailableRoleDescriptions(availableRoles.map((role) => role.description));
            } catch (error) {
                console.error("Failed to fetch schools/roles:", error);
            }
            if (userCtx.userInfo?.avatarUrn) {
                const avatarUrl = await GetUserAvatar(userCtx.userInfo?.avatarUrn)
                    .then((blob) => {
                        return URL.createObjectURL(blob);
                    })
                    .catch((error) => {
                        console.error("Failed to fetch user avatar:", error);
                        notifications.show({
                            id: "fetch-user-avatar-error",
                            title: "Error",
                            message: "Failed to fetch user avatar.",
                            color: "red",
                            icon: <IconUserExclamation />,
                        });
                        return undefined;
                    });
                setEditUserAvatarUrl(avatarUrl ? avatarUrl : null);
            } else {
                setEditUserAvatar(null);
                setEditUserAvatarUrl(null);
            }
        };
        fetchData();
    }, [userCtx.userInfo?.avatarUrn, availableSchools, availableRoles]);

    return (
        <Modal opened={isModalOpened} onClose={() => setIsModalOpened(false)} title="Edit User" centered>
            <Flex direction="column" gap="md">
                <Center>
                    <Card shadow="sm" radius="xl" withBorder style={{ position: "relative", cursor: "pointer" }}>
                        <FileButton onChange={setAvatar} accept="image/png,image/jpeg">
                            {(props) => (
                                <motion.div whileHover={{ scale: 1.05 }} style={{ position: "relative" }} {...props}>
                                    {editUserAvatarUrl ? (
                                        <Image
                                            id="edit-user-avatar"
                                            src={editUserAvatarUrl}
                                            alt="User Avatar"
                                            h={150}
                                            w={150}
                                            radius="xl"
                                        />
                                    ) : (
                                        <IconUser size={150} color="gray" />
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                            borderRadius: "var(--mantine-radius-xl)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Upload Picture
                                    </motion.div>
                                </motion.div>
                            )}
                        </FileButton>
                    </Card>
                </Center>
                {editUserAvatar && (
                    <Button
                        variant="outline"
                        color="red"
                        mt="md"
                        onClick={() => {
                            setEditUserAvatar(null);
                            setEditUserAvatarUrl(null);
                        }}
                    >
                        Remove Profile Picture
                    </Button>
                )}
                <form
                    onSubmit={form.onSubmit(handleSave)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            form.onSubmit(handleSave)();
                        }
                    }}
                >
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:username")}
                        label="Username cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:username")}
                            label="Username"
                            placeholder="Username"
                            key={form.key("username")}
                            {...form.getInputProps("username")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:name")}
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:name")}
                            label="First Name"
                            placeholder="First Name"
                            key={form.key("nameFirst")}
                            {...form.getInputProps("nameFirst")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:name")}
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:name")}
                            label="Middle Name"
                            placeholder="Middle Name"
                            key={form.key("nameMiddle")}
                            {...form.getInputProps("nameMiddle")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:name")}
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:name")}
                            label="Last Name"
                            placeholder="Last Name"
                            key={form.key("nameLast")}
                            {...form.getInputProps("nameLast")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:email")}
                        label="Email cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:email")}
                            label="Email"
                            placeholder="Email"
                            rightSection={
                                form.values.email &&
                                (userCtx.userInfo?.emailVerified && form.values.email === userCtx.userInfo?.email ? (
                                    <Tooltip
                                        label="This email has been verified. You're good to go!"
                                        withArrow
                                        multiline
                                        w={250}
                                    >
                                        <IconCircleDashedCheck size={16} color="green" />
                                    </Tooltip>
                                ) : (
                                    <Tooltip label="This email has not yet been verified." withArrow multiline w={250}>
                                        <IconCircleDashedX size={16} color="gray" />
                                    </Tooltip>
                                ))
                            }
                            key={form.key("email")}
                            {...form.getInputProps("email")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:school")}
                        label="School cannot be changed"
                        withArrow
                    >
                        <Select
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:school")}
                            label="Assigned School"
                            placeholder="School"
                            data={availableSchoolNames}
                            key={form.key("school")}
                            searchable
                            {...form.getInputProps("school")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={userCtx.userPermissions?.includes("users:self:modify:role")}
                        label="Role cannot be changed"
                        withArrow
                    >
                        <Select
                            disabled={!userCtx.userPermissions?.includes("users:self:modify:role")}
                            label="Role"
                            placeholder="Role"
                            data={availableRoleDescriptions}
                            key={form.key("role")}
                            searchable
                            {...form.getInputProps("role")}
                        />
                    </Tooltip>
                    <Group mt="md">
                        <Tooltip
                            disabled={userCtx.userPermissions?.includes("users:self:deactivate")}
                            label="Deactivation status cannot be changed"
                            withArrow
                        >
                            <Switch
                                disabled={!userCtx.userPermissions?.includes("users:self:deactivate")}
                                label="Deactivated"
                                placeholder="Deactivated"
                                key={form.key("deactivated")}
                                {...form.getInputProps("deactivated", { type: "checkbox" })}
                            />
                        </Tooltip>
                        <Tooltip
                            disabled={userCtx.userPermissions?.includes("users:self:forceupdate")}
                            label="Force Update Required cannot be changed"
                            withArrow
                        >
                            <Switch
                                disabled={!userCtx.userPermissions?.includes("users:self:forceupdate")}
                                label="Force Update Required"
                                placeholder="Force Update Required"
                                key={form.key("forceUpdateInfo")}
                                {...form.getInputProps("forceUpdateInfo", { type: "checkbox" })}
                            />
                        </Tooltip>
                    </Group>
                    <Button loading={buttonLoading} rightSection={<IconDeviceFloppy />} type="submit" fullWidth mt="xl">
                        Save
                    </Button>
                </form>
            </Flex>
        </Modal>
    );
}
