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
import { useEffect, useState } from "react";
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

    const form = useForm({
        initialValues: {
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
        },
    });

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
    const handleSave = async () => {
        buttonStateHandler.open();
        if (editIndex !== null && userChanges) {
            const newUserInfo: UserUpdateType = {
                id: userChanges.id,
                username: userChanges.username,
                nameFirst: userChanges.nameFirst,
                nameMiddle: userChanges.nameMiddle,
                nameLast: userChanges.nameLast,
                email: userChanges.email,
                schoolId: userChanges.schoolId,
                roleId: userChanges.roleId,
                deactivated: userChanges.deactivated,
                forceUpdateInfo: userChanges.forceUpdateInfo,
                finishedTutorials: null,
                password: null,
            };
            UpdateUserInfo(newUserInfo);
            try {
                setEditUser(await UpdateUserInfo(newUserInfo));
                notifications.show({
                    id: "user-update-success",
                    title: "Success",
                    message: "User information updated successfully.",
                    color: "green",
                    icon: <IconPencilCheck />,
                });

                setUsers((prevUsers) => {
                    if (editUser) {
                        const updatedUsers = [...prevUsers];
                        updatedUsers[editIndex] = editUser;
                        return updatedUsers;
                    }
                    return prevUsers;
                });

                if (editUserAvatar) {
                    try {
                        console.debug("Uploading avatar...");
                        const updatedUserInfo = await UploadUserAvatar(userChanges.id, editUserAvatar);

                        if (updatedUserInfo.avatarUrn) {
                            fetchUserAvatar(updatedUserInfo.avatarUrn);
                            console.debug("Avatar uploaded successfully.");
                            notifications.show({
                                id: "avatar-upload-success",
                                title: "Success",
                                message: "Avatar uploaded successfully.",
                                color: "green",
                                icon: <IconPencilCheck />, // better icon for upload success
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
                            throw new Error(detail);
                        }
                        buttonStateHandler.close();
                    }
                }
            } catch (error) {
                console.error("Update process failed:", error);
                notifications.show({
                    id: "user-update-error",
                    title: "Error",
                    message: (error as Error).message || "Failed to update user information. Please try again later.",
                    color: "red",
                    icon: <IconSendOff />,
                });
            }

            setEditIndex(null);
            setEditUser(null);
            setEditUserAvatar(null);
            fetchUserAvatar(editUser?.avatarUrn || ""); //to fix(refresh) the avatar URL in case it was changed
            fetchUsers(currentPage);
            buttonStateHandler.close();
        }
    };

    return (
        <Modal opened={editIndex !== null} onClose={() => setEditIndex(null)} title="Edit User" centered>
            {editUser && (
                <Flex direction="column" gap="md">
                    <Center>
                        <Card shadow="sm" radius="xl" withBorder style={{ position: "relative", cursor: "pointer" }}>
                            <FileButton onChange={setAvatar} accept="image/png,image/jpeg">
                                {(props) => (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        style={{ position: "relative" }}
                                        {...props}
                                    >
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
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:username")
                                : userCtx.userPermissions?.includes("users:global:modify:username")
                        }
                        label="Username cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:username")
                                    : !userCtx.userPermissions?.includes("users:global:modify:username")
                            }
                            label="Username"
                            value={editUser.username ? editUser.username : ""}
                            onChange={(e) => setEditUser({ ...editUser, username: e.currentTarget.value })}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:name")
                                : userCtx.userPermissions?.includes("users:global:modify:name")
                        }
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:name")
                                    : !userCtx.userPermissions?.includes("users:global:modify:name")
                            }
                            label="First Name"
                            value={editUser.nameFirst ? editUser.nameFirst : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameFirst: e.currentTarget.value })}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:name")
                                : userCtx.userPermissions?.includes("users:global:modify:name")
                        }
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:name")
                                    : !userCtx.userPermissions?.includes("users:global:modify:name")
                            }
                            label="Middle Name"
                            value={editUser.nameMiddle ? editUser.nameMiddle : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameMiddle: e.currentTarget.value })}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === userChanges?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:name")
                                : userCtx.userPermissions?.includes("users:global:modify:name")
                        }
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === userChanges?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:name")
                                    : !userCtx.userPermissions?.includes("users:global:modify:name")
                            }
                            label="Last Name"
                            value={editUser.nameLast ? editUser.nameLast : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameLast: e.currentTarget.value })}
                        />
                    </Tooltip>
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
                            data={availableSchools.map(
                                (school) => `${school.name}${school.address ? ` (${school.address})` : ""}`
                            )}
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
                            data={availableRoles.map((role) => ({
                                value: role.id.toString(),
                                label: role.description,
                            }))}
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
