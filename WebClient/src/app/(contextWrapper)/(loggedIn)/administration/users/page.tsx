"use client";

import { GetAllUsers, GetUserAvatar } from "@/lib/api/user";
import { GetAllRoles } from "@/lib/api/auth";
import { roles } from "@/lib/info";
import { RoleType, UserPublicType } from "@/lib/types";
import {
    ActionIcon,
    Avatar,
    Button,
    Checkbox,
    Flex,
    Group,
    Modal,
    Pagination,
    Select,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconSearch, IconUserExclamation } from "@tabler/icons-react";
import { JSX, useEffect, useState } from "react";

export default function UsersPage(): JSX.Element {
    const [searchTerm, setSearchTerm] = useState("");
    const [avatars, setAvatars] = useState<Map<string, string>>(new Map());
    const [avatarsRequested, setAvatarsRequested] = useState<Set<string>>(new Set());
    const [availableRoles, setAvailableRoles] = useState<RoleType[]>([]);

    const [users, setUsers] = useState<UserPublicType[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editUser, setEditUser] = useState<UserPublicType | null>(null);

    const [fetchUsersErrorShown, setFetchUsersErrorShown] = useState(false);
    const [fetchRolesErrorShown, setFetchRolesErrorShown] = useState(false);

    const handleSearch = () => {};
    const handleEdit = (index: number, user: UserPublicType) => {
        setEditIndex(index);
        setEditUser(user);
    };

    const handleSave = () => {
        if (editIndex !== null && editUser) {
            const updated = [...users];
            updated[editIndex] = editUser;
            setUsers(updated);
            setEditIndex(null);
            setEditUser(null);
        }
    };

    const toggleSelected = (index: number) => {
        const updated = new Set(selected);
        if (updated.has(index)) updated.delete(index);
        else updated.add(index);
        setSelected(updated);
    };

    const fetchUsers = async () => {
        setUsers(await GetAllUsers());
    };

    const fetchRoles = async () => {
        const rolesData = await GetAllRoles();
        setAvailableRoles(rolesData);
    };

    const fetchUserAvatar = (avatarUrn: string): string | undefined => {
        if (avatarsRequested.has(avatarUrn) && avatars.has(avatarUrn)) {
            return avatars.get(avatarUrn);
        } else if (avatarsRequested.has(avatarUrn)) {
            return undefined; // Avatar is requested but not yet available
        }
        setAvatarsRequested((prev) => new Set(prev).add(avatarUrn));
        GetUserAvatar(avatarUrn)
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                setAvatars((prev) => new Map(prev).set(avatarUrn, url));
                return url;
            })
            .catch((error) => {
                console.error("Failed to fetch user avatar:", error);
                notifications.show({
                    title: "Error",
                    message: "Failed to fetch user avatar.",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
                return undefined;
            });
    };

    useEffect(() => {
        fetchRoles().catch((error) => {
            console.error("Failed to fetch roles:", error);
            if (!fetchRolesErrorShown) {
                notifications.show({
                    title: "Error",
                    message: "Failed to fetch roles. Please try again later.",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
                setAvailableRoles([]);
                setFetchRolesErrorShown(true);
            }
        });
        fetchUsers().catch((error) => {
            console.error("Failed to fetch users:", error);
            if (!fetchUsersErrorShown) {
                notifications.show({
                    title: "Error",
                    message: "Failed to fetch users. Please try again later.",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
                setUsers([]);
                setFetchUsersErrorShown(true);
            }
        });
    }, [fetchRolesErrorShown, fetchUsersErrorShown]);

    console.debug("Rendering UsersPage");
    return (
        <>
            <Flex mih={50} gap="xl" justify="flex-start" align="center" direction="row" wrap="nowrap">
                <TextInput
                    placeholder="Search for users"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                    size="md"
                    style={{ width: "400px" }}
                />
                <Flex ml="auto" gap="sm" align="center">
                    <ActionIcon size="input-md" variant="default" onClick={handleSearch}>
                        <IconSearch size={16} />
                    </ActionIcon>
                </Flex>
            </Flex>
            <Table highlightOnHover stickyHeader stickyHeaderOffset={60}>
                <TableThead>
                    <TableTr>
                        <TableTh></TableTh>
                        <TableTh>Username</TableTh>
                        <TableTh>Name</TableTh>
                        <TableTh>Role</TableTh>
                        <TableTh>Email Address</TableTh>
                        <TableTh>Edit</TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>
                    {users.map((user, index) => (
                        <TableTr key={index} bg={selected.has(index) ? "gray.1" : undefined}>
                            {/* Checkbox */}
                            <TableTd>
                                <Group>
                                    <Checkbox checked={selected.has(index)} onChange={() => toggleSelected(index)} />
                                    <Avatar
                                        radius="xl"
                                        src={user.avatarUrn ? fetchUserAvatar(user.avatarUrn) : undefined}
                                    />
                                </Group>
                            </TableTd>
                            <TableTd>{user.username}</TableTd>
                            <TableTd>
                                {user.nameFirst == null && user.nameMiddle == null && user.nameLast == null && (
                                    <Text size="sm" c="dimmed">
                                        N/A
                                    </Text>
                                )}
                                {user.nameFirst}{" "}
                                {user.nameMiddle
                                    ? user.nameMiddle
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join(".") + ". "
                                    : ""}
                                {user.nameLast}
                            </TableTd>
                            <TableTd>{roles[user.roleId]}</TableTd>
                            <TableTd>
                                {user.email ? (
                                    user.email
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        N/A
                                    </Text>
                                )}
                            </TableTd>
                            <TableTd>
                                <ActionIcon variant="light" onClick={() => handleEdit(index, user)}>
                                    <IconEdit size={16} />
                                </ActionIcon>
                            </TableTd>
                        </TableTr>
                    ))}
                </TableTbody>
            </Table>

            <Group justify="center">
                <Pagination total={1} mt="md" />
            </Group>

            <Modal opened={editIndex !== null} onClose={() => setEditIndex(null)} title="Edit User" centered>
                {editUser && (
                    <Flex direction="column" gap="md">
                        <TextInput
                            disabled
                            label="Username"
                            value={editUser.username ? editUser.username : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameFirst: e.currentTarget.value })}
                        />
                        <TextInput
                            label="First Name"
                            value={editUser.nameFirst ? editUser.nameFirst : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameFirst: e.currentTarget.value })}
                        />
                        <TextInput
                            label="Middle Name"
                            value={editUser.nameMiddle ? editUser.nameMiddle : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameMiddle: e.currentTarget.value })}
                        />
                        <TextInput
                            label="Last Name"
                            value={editUser.nameLast ? editUser.nameLast : ""}
                            onChange={(e) => setEditUser({ ...editUser, nameLast: e.currentTarget.value })}
                        />
                        <TextInput
                            label="Email"
                            value={editUser.email ? editUser.email : ""}
                            onChange={(e) => setEditUser({ ...editUser, email: e.currentTarget.value })}
                        />
                        <Select
                            label="Role"
                            placeholder="Role"
                            data={availableRoles.map((role) => role.description)}
                            value={editUser.roleId ? roles[editUser.roleId] : undefined}
                            onChange={(value) => {
                                const role = availableRoles.find((role) => role.description === value);
                                const selectedRoleId = role?.id;
                                setEditUser(
                                    value ? { ...editUser, roleId: selectedRoleId ?? editUser.roleId } : editUser
                                );
                            }}
                        />
                        <Button onClick={handleSave}>Save</Button>
                    </Flex>
                )}
            </Modal>
        </>
    );
}
