"use client";

import { GetAllUsers, GetUserAvatar } from "@/lib/api/user";
import { roles } from "@/lib/info";
import { UserPublicType } from "@/lib/types";
import {
    ActionIcon,
    Avatar,
    Button,
    Checkbox,
    Flex,
    Group,
    Text,
    TextInput as MantineInput,
    Modal,
    Pagination,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconSearch, IconUserExclamation } from "@tabler/icons-react";
import { JSX, useEffect, useState } from "react";

export default function UsersPage(): JSX.Element {
    const [searchTerm, setSearchTerm] = useState("");
    const [avatars, setAvatars] = useState<Map<string, string>>(new Map());
    const [avatarsRequested, setAvatarsRequested] = useState<Set<string>>(new Set());

    const [users, setUsers] = useState<UserPublicType[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editUser, setEditUser] = useState<UserPublicType | null>(null);

    const handleSearch = () => {};
    const handleEdit = (index: number) => {
        setEditIndex(index);
        setEditUser(users[index]);
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
        fetchUsers().catch((error) => {
            console.error("Failed to fetch users:", error);
            notifications.show({
                title: "Error",
                message: "Failed to fetch users. Please try again later.",
                color: "red",
                icon: <IconUserExclamation />,
            });
            setUsers([]);
        });
    }, []);

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
                                <ActionIcon variant="light" onClick={() => handleEdit(index)}>
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
                        <MantineInput
                            label="First Name"
                            value={editUser.firstName}
                            onChange={(e) => setEditUser({ ...editUser, firstName: e.currentTarget.value })}
                        />
                        <MantineInput
                            label="Middle Name"
                            value={editUser.middleName}
                            onChange={(e) => setEditUser({ ...editUser, middleName: e.currentTarget.value })}
                        />
                        <MantineInput
                            label="Last Name"
                            value={editUser.lastName}
                            onChange={(e) => setEditUser({ ...editUser, lastName: e.currentTarget.value })}
                        />
                        <MantineInput
                            label="Email"
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.currentTarget.value })}
                        />
                        <MantineInput
                            label="Contact Number"
                            value={editUser.contactNumber}
                            onChange={(e) => setEditUser({ ...editUser, contactNumber: e.currentTarget.value })}
                        />
                        <MantineInput
                            label="Address"
                            value={editUser.address}
                            onChange={(e) => setEditUser({ ...editUser, address: e.currentTarget.value })}
                        />
                        <Button onClick={handleSave}>Save</Button>
                    </Flex>
                )}
            </Modal>
        </>
    );
}
