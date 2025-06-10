"use client";

import { EditUserComponent } from "@/components/UserManagement/EditUserComponent";
import { CreateUser, GetAllRoles, RequestVerificationEmail } from "@/lib/api/auth";
import { GetAllSchools } from "@/lib/api/school";
import { GetAllUsers, GetUserAvatar, GetUsersQuantity, UpdateUserInfo, UploadUserAvatar } from "@/lib/api/user";
import { roles } from "@/lib/info";
import { RoleType, SchoolType, UserPublicType } from "@/lib/types";
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
    Stack,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCheck,
    IconCircleDashedCheck,
    IconCircleDashedX,
    IconEdit,
    IconLock,
    IconLockOpen,
    IconMail,
    IconPlus,
    IconSearch,
    IconSendOff,
    IconUser,
    IconUserCheck,
    IconUserExclamation,
    IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { JSX, useEffect, useState } from "react";

export default function UsersPage(): JSX.Element {
    const userPerPage = 10; // Number of users per page
    const [searchTerm, setSearchTerm] = useState("");
    const [avatars, setAvatars] = useState<Map<string, string>>(new Map());
    const [avatarsRequested, setAvatarsRequested] = useState<Set<string>>(new Set());
    const [availableRoles, setAvailableRoles] = useState<RoleType[]>([]);
    const [availableSchools, setAvailableSchools] = useState<SchoolType[]>([]); // Assuming schools are strings for simplicity

    const [users, setUsers] = useState<UserPublicType[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);

    const [fetchUsersErrorShown, setFetchUsersErrorShown] = useState(false);
    const [fetchRolesErrorShown, setFetchRolesErrorShown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedUser, setSelectedUser] = useState<UserPublicType | null>(null);
    const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [createUserFullName, setCreateUserFullName] = useState("");
    const [createUserEmail, setCreateUserEmail] = useState("");
    const [createUserPassword, setCreateUserPassword] = useState("");
    const [createUserUsername, setCreateUserUsername] = useState("");
    const [createUserAssignedSchool, setCreateUserAssignedSchool] = useState<number | null>(null);
    const [createUserRole, setCreateUserRole] = useState<number | null>();

    const handleSearch = () => {};
    const handleEdit = (index: number, user: UserPublicType) => {
        console.debug(`Editing user ${index}`, user);
        setSelectedUserIndex(index);
        setSelectedUser(user);
    };

    const toggleSelected = (index: number) => {
        const updated = new Set(selected);
        if (updated.has(index)) updated.delete(index);
        else updated.add(index);
        setSelected(updated);
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
                    id: "fetch-user-avatar-error",
                    title: "Error",
                    message: "Failed to fetch user avatar.",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
                return undefined;
            });
    };

    const fetchUsers = async (page: number) => {
        setCurrentPage(page);
        const pageOffset = (page - 1) * userPerPage;
        GetUsersQuantity()
            .then((quantity) => {
                setTotalPages(Math.ceil(quantity / userPerPage));
            })
            .catch((error) => {
                console.error("Failed to fetch users quantity:", error);
                notifications.show({
                    id: "fetch-users-quantity-error",
                    title: "Error",
                    message: "Failed to fetch users quantity. Please try again later.",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
                setTotalPages(1); // Default to 1 page if fetching fails
            });
        await GetAllUsers(pageOffset, userPerPage)
            .then((data) => {
                setUsers(data);
            })
            .catch((error) => {
                console.error("Failed to fetch users:", error);
                if (!fetchUsersErrorShown) {
                    setFetchUsersErrorShown(true);
                    notifications.show({
                        id: "fetch-users-error",
                        title: "Failed to fetch users list",
                        message: "Please try again later.",
                        color: "red",
                        icon: <IconUserExclamation />,
                    });
                    setUsers([]);
                }
            });
    };

    useEffect(() => {
        const fetchRoles = async () => {
            await GetAllRoles()
                .then((data) => {
                    setAvailableRoles(data);
                })
                .catch((error) => {
                    console.error("Failed to fetch roles:", error);
                    if (!fetchRolesErrorShown) {
                        setFetchRolesErrorShown(true);
                        notifications.show({
                            id: "fetch-roles-error",
                            title: "Failed to fetch roles",
                            message: "Please try again later.",
                            color: "red",
                            icon: <IconUserExclamation />,
                        });
                        setAvailableRoles([]);
                    }
                });
        };
        const fetchSchools = async () => {
            await GetAllSchools(0, 99)
                .then((data) => {
                    setAvailableSchools(data);
                })
                .catch((error) => {
                    console.error("Failed to fetch schools:", error);
                    notifications.show({
                        id: "fetch-schools-error",
                        title: "Error",
                        message: "Failed to fetch schools. Please try again later.",
                        color: "red",
                        icon: <IconUserExclamation />,
                    });
                });
        };

        fetchRoles();
        fetchUsers(1);
        fetchSchools();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchRolesErrorShown, setUsers, fetchUsersErrorShown]);

    //Function to handle user creation
    const handleCreateUser = async () => {
        buttonStateHandler.open();
        if (!createUserUsername || !createUserRole || !createUserPassword) {
            notifications.show({
                id: "create-user-error",
                title: "Error",
                message: "Username, role, and password fields are required",
                color: "red",
                icon: <IconUserExclamation />,
            });
            buttonStateHandler.close();
            return;
        }

        try {
            const new_user = await CreateUser(createUserUsername, createUserRole, createUserPassword);
            await UpdateUserInfo({
                id: new_user.id,
                username: createUserUsername,
                email: createUserEmail === "" ? null : createUserEmail,
                nameFirst: createUserFullName.split(" ")[0],
                nameMiddle: createUserFullName.split(" ").slice(1, -1).join(" ") || null,
                nameLast: createUserFullName.split(" ").slice(-1)[0],
                schoolId: createUserAssignedSchool,
                roleId: createUserRole,
            });
            notifications.show({
                id: "create-user-success",
                title: "Success",
                message: "User created successfully",
                color: "green",
                icon: <IconUserCheck />,
            });
            setAddModalOpen(false);
            setCreateUserFullName("");
            setCreateUserEmail("");
            setCreateUserPassword("");
            setCreateUserUsername("");
            setCreateUserAssignedSchool(null);
            setCreateUserRole(null);
            fetchUsers(currentPage);
        } catch (err) {
            if (err instanceof Error) {
                notifications.show({
                    id: "create-user-error",
                    title: "Error",
                    message: `Failed to create user: ${err.message}`,
                    color: "red",
                    icon: <IconUserExclamation />,
                });
            } else {
                notifications.show({
                    id: "create-user-error",
                    title: "Error",
                    message: "Failed to create user",
                    color: "red",
                    icon: <IconUserExclamation />,
                });
            }
        }
        buttonStateHandler.close();
    };

    //Function to for Hover and Mouse Tracking on User Card
    // const [hoveredUser, setHoveredUser] = useState<UserPublicType | null>(null);
    // const [mouseX, setMouseX] = useState(0);
    // const [mouseY, setMouseY] = useState(0);
    //
    // useEffect(() => {
    //     const handleMouseMove = (e: MouseEvent) => {
    //         setMouseX(e.clientX);
    //         setMouseY(e.clientY);
    //     };
    //     window.addEventListener("mousemove", handleMouseMove);
    //     return () => window.removeEventListener("mousemove", handleMouseMove);
    // }, []);

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
                    <ActionIcon size="input-md" variant="filled" color="blue" onClick={() => setAddModalOpen(true)}>
                        <IconPlus size={18} />
                    </ActionIcon>
                    <ActionIcon size="input-md" variant="default" onClick={handleSearch}>
                        <IconSearch size={16} />
                    </ActionIcon>
                </Flex>
            </Flex>
            <Table highlightOnHover stickyHeader stickyHeaderOffset={60}>
                <TableThead>
                    <TableTr>
                        <TableTh></TableTh> {/* Checkbox and Avatar */}
                        <TableTh>Username</TableTh>
                        <TableTh>Email</TableTh>
                        <TableTh>Name</TableTh>
                        <TableTh>Assigned School</TableTh>
                        <TableTh>Role</TableTh>
                        <TableTh></TableTh>
                        <TableTh></TableTh>
                        <TableTh>Edit</TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>
                    {users.map((user, index) => (
                        <TableTr
                            key={index}
                            bg={selected.has(index) ? "gray.1" : undefined}
                            // onMouseEnter={() => setHoveredUser(user)}
                            // onMouseLeave={() => setHoveredUser(null)}
                        >
                            {/* Checkbox and Avatar */}
                            <TableTd>
                                <Group>
                                    <Checkbox checked={selected.has(index)} onChange={() => toggleSelected(index)} />
                                    {user.avatarUrn ? (
                                        <Avatar radius="xl" src={fetchUserAvatar(user.avatarUrn)}>
                                            <IconUser />
                                        </Avatar>
                                    ) : (
                                        <Avatar
                                            radius="xl"
                                            name={user.nameFirst + " " + user.nameLast}
                                            color="initials"
                                        />
                                    )}
                                </Group>
                            </TableTd>
                            <TableTd c={user.deactivated ? "dimmed" : undefined}>{user.username}</TableTd>
                            <TableTd c={user.deactivated ? "dimmed" : undefined}>
                                <Group gap="xs" align="center">
                                    {user.email &&
                                        (user.emailVerified ? (
                                            <Tooltip label="Email verified" position="bottom" withArrow>
                                                <IconCircleDashedCheck size={16} color="green" />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip
                                                label="Email not verified (Click to send verification mail)"
                                                position="bottom"
                                                withArrow
                                            >
                                                <motion.div
                                                    whileTap={{ scale: 0.9 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <IconCircleDashedX
                                                        size={16}
                                                        color="gray"
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
                                                    />
                                                </motion.div>
                                            </Tooltip>
                                        ))}
                                    {user.email ? (
                                        user.email
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            N/A
                                        </Text>
                                    )}
                                </Group>
                            </TableTd>
                            <TableTd c={user.deactivated ? "dimmed" : undefined}>
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
                            <TableTd c={user.deactivated ? "dimmed" : undefined}>
                                {user.schoolId ? (
                                    availableSchools.find((school) => school.id === user.schoolId)?.name || (
                                        <Text size="sm" c="dimmed">
                                            N/A
                                        </Text>
                                    )
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        N/A
                                    </Text>
                                )}
                            </TableTd>
                            <TableTd c={user.deactivated ? "dimmed" : undefined}>{roles[user.roleId]}</TableTd>
                            <TableTd>
                                <Tooltip
                                    label={user.deactivated ? "User is deactivated" : "User is active"}
                                    position="bottom"
                                    withArrow
                                >
                                    {user.deactivated ? <IconLock color="gray" /> : <IconLockOpen color="green" />}
                                </Tooltip>
                            </TableTd>
                            <TableTd>
                                <Tooltip label="Force Update Required" position="bottom" withArrow>
                                    {user.forceUpdateInfo ? <IconCheck color="gray" /> : <IconX color="gray" />}
                                </Tooltip>
                            </TableTd>
                            <TableTd>
                                <Tooltip label="Edit User" position="bottom" openDelay={500} withArrow>
                                    <ActionIcon variant="light" onClick={() => handleEdit(index, user)}>
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </TableTd>
                        </TableTr>
                    ))}
                </TableTbody>
            </Table>
            {/* <AnimatePresence>
                {hoveredUser && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            position: "fixed",
                            top: mouseY + 16,
                            left: mouseX + 16,
                            zIndex: 1000,
                            pointerEvents: "none",
                        }}
                    >
                        <Card shadow="md" radius="md" withBorder style={{ width: 250 }}>
                            <Stack gap="xs">
                                <Group>
                                    {hoveredUser.avatarUrn ? (
                                        <Avatar radius="xl" src={fetchUserAvatar(hoveredUser.avatarUrn)}>
                                            <IconUser />
                                        </Avatar>
                                    ) : (
                                        <Avatar
                                            radius="xl"
                                            name={hoveredUser.nameFirst + " " + hoveredUser.nameLast}
                                            color="initials"
                                        />
                                    )}
                                    <Stack gap={0}>
                                        <Text fw={500}>
                                            {hoveredUser.nameFirst}{" "}
                                            {hoveredUser.nameMiddle
                                                ? hoveredUser.nameMiddle
                                                      .split(" ")
                                                      .map((n) => n[0])
                                                      .join(".") + ". "
                                                : ""}
                                            {hoveredUser.nameLast}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {hoveredUser.email}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {roles[hoveredUser.roleId]}
                                        </Text>
                                    </Stack>
                                </Group>
                            </Stack>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence> */}
            <Group justify="center">
                <Pagination value={currentPage} onChange={fetchUsers} total={totalPages} mt="md" />
            </Group>
            {selectedUserIndex !== null && selectedUser !== null && (
                <EditUserComponent
                    index={selectedUserIndex}
                    user={selectedUser}
                    availableSchools={availableSchools}
                    availableRoles={availableRoles}
                    currentPage={currentPage}
                    fetchUsers={fetchUsers}
                    setUsers={setUsers}
                    UpdateUserInfo={UpdateUserInfo}
                    UploadUserAvatar={UploadUserAvatar}
                    fetchUserAvatar={fetchUserAvatar}
                />
            )}

            <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New User">
                <Stack>
                    <TextInput
                        label="Full Name"
                        value={createUserFullName}
                        onChange={(e) => setCreateUserFullName(e.currentTarget.value)}
                    />
                    <TextInput
                        withAsterisk
                        label="Username"
                        value={createUserUsername}
                        onChange={(e) => setCreateUserUsername(e.currentTarget.value)}
                    />
                    <TextInput
                        label="Email"
                        value={createUserEmail}
                        onChange={(e) => setCreateUserEmail(e.currentTarget.value)}
                    />
                    <TextInput
                        withAsterisk
                        label="Password"
                        type="password"
                        value={createUserPassword}
                        onChange={(e) => setCreateUserPassword(e.currentTarget.value)}
                    />
                    <Select
                        label="Assigned School"
                        placeholder="School"
                        data={availableSchools.map(
                            (school) => `${school.name}${school.address ? ` (${school.address})` : ""}`
                        )}
                        onChange={(e) => {
                            const school = availableSchools.find(
                                (s) => `${s.name}${s.address ? ` (${s.address})` : ""}` === e
                            );
                            setCreateUserAssignedSchool(school?.id ?? null);
                        }}
                    />
                    <Select
                        withAsterisk
                        label="Role"
                        placeholder="Role"
                        data={availableRoles.map((role) => role.description)}
                        onChange={(e) => {
                            setCreateUserRole(availableRoles.find((role) => role.description === e)?.id ?? null);
                        }}
                    />
                    <Button loading={buttonLoading} rightSection={<IconUserCheck />} onClick={handleCreateUser}>
                        Create User
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}
