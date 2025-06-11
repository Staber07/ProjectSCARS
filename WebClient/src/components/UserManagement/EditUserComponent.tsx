"use client";
import { roles, userAvatarConfig } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { RoleType, SchoolType, UserPublicType, UserUpdateType } from "@/lib/types";
import {
    Button,
    Card,
    Center,
    FileButton,
    Flex,
    Image,
    Modal,
    Select,
    Switch,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCircleDashedCheck,
    IconCircleDashedX,
    IconDeviceFloppy,
    IconPencilCheck,
    IconSendOff,
    IconUser,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";

interface EditUserProps {
    index: number;
    user: UserPublicType;
    availableSchools: SchoolType[];
    availableRoles: RoleType[];
    currentPage: number;
    fetchUsers: (page: number) => void;
    setUsers: React.Dispatch<React.SetStateAction<UserPublicType[]>>;
    UpdateUserInfo: (userInfo: UserUpdateType) => Promise<UserPublicType>;
    UploadUserAvatar: (userId: string, file: File) => Promise<UserPublicType>;
    fetchUserAvatar: (avatarUrn: string) => string | undefined;
}

const UserAvatar = memo(({ url, onUpload }: { url: string | null; onUpload: (file: File | null) => void }) => (
    <Center>
        <Card shadow="sm" radius="xl" withBorder style={{ position: "relative", cursor: "pointer" }}>
            <FileButton onChange={onUpload} accept="image/png,image/jpeg">
                {(props) => (
                    <motion.div whileHover={{ scale: 1.05 }} style={{ position: "relative" }} {...props}>
                        {url ? (
                            <Image id="edit-user-avatar" src={url} alt="User Avatar" h={150} w={150} radius="xl" />
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
));

const FormField = memo(
    ({
        label,
        value,
        onChange,
        disabled,
        tooltip,
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
        disabled: boolean;
        tooltip: string;
    }) => (
        <Tooltip disabled={!disabled} label={tooltip} withArrow>
            <TextInput
                disabled={disabled}
                label={label}
                value={value}
                onChange={(e) => onChange(e.currentTarget.value)}
            />
        </Tooltip>
    )
);

export function EditUserComponent({
    index,
    user,
    availableSchools,
    availableRoles,
    currentPage,
    fetchUsers,
    setUsers,
    UpdateUserInfo,
    UploadUserAvatar,
    fetchUserAvatar,
}: EditUserProps) {
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editUser, setEditUser] = useState<UserPublicType | null>(null);
    const [userChanges, setUserChanges] = useState<UserUpdateType | null>(null);
    const [editUserPrevEmail, setEditUserPrevEmail] = useState<string | null>(null);
    const [editUserAvatar, setEditUserAvatar] = useState<File | null>(null);
    const [editUserAvatarUrl, setEditUserAvatarUrl] = useState<string | null>(null);
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);

    const userCtx = useUser();

    const formValues = useMemo(
        () => ({
            id: user.id,
            username: user.username || "",
            nameFirst: user.nameFirst || "",
            nameMiddle: user.nameMiddle || "",
            nameLast: user.nameLast || "",
            email: user.email || "",
            schoolId: user.schoolId || null,
            roleId: user.roleId || null,
            deactivated: user.deactivated || false,
            forceUpdateInfo: user.forceUpdateInfo || false,
        }),
        [user]
    );

    const form = useForm({
        initialValues: formValues,
    });

    const schoolOptions = useMemo(
        () =>
            availableSchools.map((school) => ({
                value: school.id.toString(),
                label: `${school.name}${school.address ? ` (${school.address})` : ""}`,
            })),
        [availableSchools]
    );

    const roleOptions = useMemo(
        () =>
            availableRoles.map((role) => ({
                value: role.id.toString(),
                label: role.description,
            })),
        [availableRoles]
    );

    useEffect(() => {
        setEditIndex(index);
        setEditUser(user);
        setUserChanges({ id: user.id });
        setEditUserPrevEmail(user.email || null);
        if (user.avatarUrn) {
            const avatarUrl = fetchUserAvatar(user.avatarUrn);
            setEditUserAvatarUrl(avatarUrl ? avatarUrl : null);
        } else {
            setEditUserAvatar(null);
            setEditUserAvatarUrl(null);
        }
    }, [index, user, fetchUserAvatar]);

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

    const handleAvatarUpload = useCallback(
        async (file: File | null) => {
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
        },
        [userAvatarConfig.MAX_FILE_SIZE_MB, userAvatarConfig.ALLOWED_FILE_TYPES]
    );

    const handleSave = useCallback(async () => {
        buttonStateHandler.open();
        if (editIndex !== null && userChanges) {
            try {
                // Create a clean update object with only modified fields
                const newUserInfo: UserUpdateType = {
                    id: userChanges.id,
                    // Only include fields that have actually changed
                    ...(editUser?.username !== user.username && { username: editUser?.username }),
                    ...(editUser?.nameFirst !== user.nameFirst && { nameFirst: editUser?.nameFirst }),
                    ...(editUser?.nameMiddle !== user.nameMiddle && { nameMiddle: editUser?.nameMiddle }),
                    ...(editUser?.nameLast !== user.nameLast && { nameLast: editUser?.nameLast }),
                    ...(editUser?.email !== user.email && { email: editUser?.email }),
                    ...(editUser?.schoolId !== user.schoolId && { schoolId: editUser?.schoolId }),
                    ...(editUser?.roleId !== user.roleId && { roleId: editUser?.roleId }),
                    ...(editUser?.deactivated !== user.deactivated && { deactivated: editUser?.deactivated }),
                    ...(editUser?.forceUpdateInfo !== user.forceUpdateInfo && {
                        forceUpdateInfo: editUser?.forceUpdateInfo,
                    }),
                    // Set these to null as they shouldn't be modified in this context
                    finishedTutorials: null,
                    password: null,
                };

                console.debug("Sending update with payload:", newUserInfo);

                // Wait for user info update
                const updatedUser = await UpdateUserInfo(newUserInfo);

                // Update local state with new user data
                setEditUser(updatedUser);

                // Update users list immediately
                setUsers((prevUsers) => {
                    const updatedUsers = [...prevUsers];
                    updatedUsers[editIndex] = updatedUser;
                    return updatedUsers;
                });

                // Handle avatar upload if needed
                if (editUserAvatar) {
                    try {
                        console.debug("Uploading avatar...");
                        const userWithNewAvatar = await UploadUserAvatar(userChanges.id, editUserAvatar);

                        // Update local state again with new avatar
                        setUsers((prevUsers) => {
                            const updatedUsers = [...prevUsers];
                            updatedUsers[editIndex] = {
                                ...updatedUser,
                                avatarUrn: userWithNewAvatar.avatarUrn,
                            };
                            return updatedUsers;
                        });

                        if (userWithNewAvatar.avatarUrn) {
                            await fetchUserAvatar(userWithNewAvatar.avatarUrn);
                            notifications.show({
                                id: "avatar-upload-success",
                                title: "Success",
                                message: "Avatar uploaded successfully.",
                                color: "green",
                                icon: <IconPencilCheck />,
                            });
                        }
                    } catch (error) {
                        console.error("Avatar upload failed:", error);
                        notifications.show({
                            id: "avatar-upload-error",
                            title: "Avatar Upload Failed",
                            message: error instanceof Error ? error.message : "Failed to upload avatar",
                            color: "red",
                            icon: <IconSendOff />,
                        });
                    }
                }

                // Show success notification
                notifications.show({
                    id: "user-update-success",
                    title: "Success",
                    message: "User information updated successfully.",
                    color: "green",
                    icon: <IconPencilCheck />,
                });

                // Refresh the users list to ensure consistency
                await fetchUsers(currentPage);

                // Reset states
                setEditIndex(null);
                setEditUser(null);
                setEditUserAvatar(null);
                setUserChanges(null);
            } catch (error) {
                console.error("Update process failed:", error);
                notifications.show({
                    id: "user-update-error",
                    title: "Error",
                    message: error instanceof Error ? error.message : "Failed to update user information",
                    color: "red",
                    icon: <IconSendOff />,
                });
            } finally {
                buttonStateHandler.close();
            }
        }
    }, [editIndex, userChanges, editUser, editUserAvatar]);

    // Memoize permission checks
    const permissions = useMemo(
        () => ({
            canModifyUsername:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:modify:username")
                    : userCtx.userPermissions?.includes("users:global:modify:username"),
            canModifyName:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:modify:name")
                    : userCtx.userPermissions?.includes("users:global:modify:name"),
            canModifyEmail:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:modify:email")
                    : userCtx.userPermissions?.includes("users:global:modify:email"),
            canModifySchool:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:modify:school")
                    : userCtx.userPermissions?.includes("users:global:modify:school"),
            canModifyRole:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:modify:role")
                    : userCtx.userPermissions?.includes("users:global:modify:role"),
            canDeactivate:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:deactivate")
                    : userCtx.userPermissions?.includes("users:global:deactivate"),
            canForceUpdate:
                userCtx.userInfo?.id === userChanges?.id
                    ? userCtx.userPermissions?.includes("users:self:forceupdate")
                    : userCtx.userPermissions?.includes("users:global:forceupdate"),
        }),
        [userCtx.userInfo?.id, userChanges?.id, userCtx.userPermissions]
    );

    return (
        <Modal opened={editIndex !== null} onClose={() => setEditIndex(null)} title="Edit User" centered>
            {editUser && (
                <Flex direction="column" gap="md">
                    <UserAvatar url={editUserAvatarUrl} onUpload={handleAvatarUpload} />

                    <FormField
                        label="Username"
                        value={editUser.username || ""}
                        onChange={(value) => setEditUser({ ...editUser, username: value })}
                        disabled={!permissions.canModifyUsername}
                        tooltip="Username cannot be changed"
                    />

                    <FormField
                        label="First Name"
                        value={editUser.nameFirst || ""}
                        onChange={(value) => setEditUser({ ...editUser, nameFirst: value })}
                        disabled={!permissions.canModifyName}
                        tooltip="Name cannot be changed"
                    />

                    <FormField
                        label="Middle Name"
                        value={editUser.nameMiddle || ""}
                        onChange={(value) => setEditUser({ ...editUser, nameMiddle: value })}
                        disabled={!permissions.canModifyName}
                        tooltip="Name cannot be changed"
                    />

                    <FormField
                        label="Last Name"
                        value={editUser.nameLast || ""}
                        onChange={(value) => setEditUser({ ...editUser, nameLast: value })}
                        disabled={!permissions.canModifyName}
                        tooltip="Name cannot be changed"
                    />

                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:email")
                                : userCtx.userPermissions?.includes("users:global:modify:email")
                        }
                        label="Email cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:email")
                                    : !userCtx.userPermissions?.includes("users:global:modify:email")
                            }
                            label="Email"
                            value={editUser.email ? editUser.email : ""}
                            rightSection={
                                editUser.email &&
                                (editUser.emailVerified && editUser.email == editUserPrevEmail ? (
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
                            onChange={(e) => {
                                setEditUser({ ...editUser, email: e.currentTarget.value });
                            }}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:school")
                                : userCtx.userPermissions?.includes("users:global:modify:school")
                        }
                        label="School cannot be changed"
                        withArrow
                    >
                        <Select
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:school")
                                    : !userCtx.userPermissions?.includes("users:global:modify:school")
                            }
                            label="Assigned School"
                            placeholder="School"
                            data={schoolOptions}
                            onChange={(e) => {
                                const school = availableSchools.find(
                                    (s) => `${s.name}${s.address ? ` (${s.address})` : ""}` === e
                                );
                                setEditUser({ ...editUser, schoolId: school?.id ?? null });
                            }}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:role")
                                : userCtx.userPermissions?.includes("users:global:modify:role")
                        }
                        label="Role cannot be changed"
                        withArrow
                    >
                        <Select
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:role")
                                    : !userCtx.userPermissions?.includes("users:global:modify:role")
                            }
                            label="Role"
                            placeholder="Role"
                            data={roleOptions}
                            value={editUser.roleId?.toString()}
                            onChange={(value) => {
                                if (value) {
                                    const roleId = parseInt(value);
                                    setEditUser({ ...editUser, roleId });
                                    // Also update userChanges to ensure the change is tracked
                                    setUserChanges((prev) => ({
                                        ...(prev ?? { id: user.id }),
                                        roleId,
                                    }));
                                }
                            }}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:deactivate")
                                : userCtx.userPermissions?.includes("users:global:deactivate")
                        }
                        label="Deactivation status cannot be changed"
                        withArrow
                    >
                        <Switch
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:deactivate")
                                    : !userCtx.userPermissions?.includes("users:global:deactivate")
                            }
                            label="Deactivated"
                            checked={editUser.deactivated}
                            onChange={(e) => {
                                setEditUser({
                                    ...editUser,
                                    deactivated: e.currentTarget.checked,
                                });
                            }}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:forceupdate")
                                : userCtx.userPermissions?.includes("users:global:forceupdate")
                        }
                        label="Force Update Required cannot be changed"
                        withArrow
                    >
                        <Switch
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:forceupdate")
                                    : !userCtx.userPermissions?.includes("users:global:forceupdate")
                            }
                            label="Force Update Required"
                            checked={editUser.forceUpdateInfo}
                            onChange={(e) => {
                                setEditUser({
                                    ...editUser,
                                    forceUpdateInfo: e.currentTarget.checked,
                                });
                            }}
                        />
                    </Tooltip>
                    <Button loading={buttonLoading} rightSection={<IconDeviceFloppy />} onClick={handleSave}>
                        Save
                    </Button>
                </Flex>
            )}
        </Modal>
    );
}
