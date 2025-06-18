"use client";

import { CreateUserComponent } from "@/components/UserManagement/CreateUserComponent";
import { EditUserComponent } from "@/components/UserManagement/EditUserComponent";
import { GetAllRoles, RequestVerificationEmail } from "@/lib/api/auth";
import { GetAllSchools } from "@/lib/api/school";
import { GetAllUsers, GetUserAvatar, GetUsersQuantity, UpdateUserInfo, UploadUserAvatar } from "@/lib/api/user";
import { roles } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { RoleType, SchoolType, UserPublicType } from "@/lib/types";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Button,
    Checkbox,
    Flex,
    Group,
    Menu,
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
    IconUserOff,
    IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { JSX, useCallback, useEffect, useState } from "react";
import { UserFilters } from "@/components/UserManagement/UserFilters";

const userPerPageOptions: number[] = [10, 25, 50, 100];

export default function UsersPage(): JSX.Element {
    const userCtx = useUser();
    const [userPerPage, setUserPerPage] = useState(userPerPageOptions[0]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [avatars, setAvatars] = useState<Map<string, string>>(new Map());
    const [avatarsRequested, setAvatarsRequested] = useState<Set<string>>(new Set());
    const [availableRoles, setAvailableRoles] = useState<RoleType[]>([]);
    const [availableSchools, setAvailableSchools] = useState<SchoolType[]>([]); // Assuming schools are strings for simplicity

    const [users, setUsers] = useState<UserPublicType[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const [fetchUsersErrorShown, setFetchUsersErrorShown] = useState(false);
    const [fetchRolesErrorShown, setFetchRolesErrorShown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedUser, setSelectedUser] = useState<UserPublicType | null>(null);
    const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

    const [openCreateUserModal, setOpenCreateUserModal] = useState(false);

    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [updateFilter, setUpdateFilter] = useState<string | null>(null);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(new Set(users.map((_, idx) => idx)));
        } else {
            setSelected(new Set());
        }
    };

    const handleSearch = () => {};
    const handleCreate = () => {
        console.debug("Creating new user");
        // Clear selected user when opening create modal
        setSelectedUser(null);
        setSelectedUserIndex(null);
        setOpenCreateUserModal(true);
    };
    const handleEdit = (index: number, user: UserPublicType) => {
        console.debug(`Editing user ${index}`, user);
        setSelectedUserIndex(index);
        setSelectedUser(user);
    };

    // Handle bulk actions for selected users
    const handleBulkAction = async (action: "deactivate" | "reactivate") => {
        const selectedUsers = Array.from(selected).map((idx) => users[idx]);
        const isDeactivate = action === "deactivate";

        try {
            // Update all selected users
            await Promise.all(
                selectedUsers.map((user) =>
                    UpdateUserInfo({
                        id: user.id,
                        deactivated: isDeactivate,
                    })
                )
            );

            // Update local state to reflect changes
            const updatedUsers = [...users];
            Array.from(selected).forEach((idx) => {
                updatedUsers[idx] = {
                    ...updatedUsers[idx],
                    deactivated: isDeactivate,
                };
            });
            setUsers(updatedUsers);

            // Clear selection
            setSelected(new Set());

            notifications.show({
                title: "Success",
                message: `Successfully ${isDeactivate ? "deactivated" : "reactivated"} ${selectedUsers.length} user(s)`,
                color: "green",
                icon: isDeactivate ? <IconUserOff /> : <IconUserCheck />,
            });
        } catch (error) {
            console.error("Bulk action error:", error);
            notifications.show({
                title: "Error",
                message: `Failed to ${isDeactivate ? "deactivate" : "reactivate"} users`,
                color: "red",
                icon: <IconUserExclamation />,
            });
        }
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

    const applyFilters = useCallback(
        (users: UserPublicType[]) => {
            let filtered = [...users];

            if (roleFilter) {
                filtered = filtered.filter((user) => user.roleId.toString() === roleFilter);
            }
            if (schoolFilter) {
                filtered = filtered.filter(
                    (user) => user.schoolId != null && user.schoolId.toString() === schoolFilter
                );
            }
            if (statusFilter) {
                filtered = filtered.filter((user) =>
                    statusFilter === "deactivated" ? user.deactivated : !user.deactivated
                );
            }
            if (updateFilter) {
                filtered = filtered.filter((user) =>
                    updateFilter === "required" ? user.forceUpdateInfo : !user.forceUpdateInfo
                );
            }

            return filtered;
        },
        [roleFilter, schoolFilter, statusFilter, updateFilter]
    );

    const fetchUsers = useCallback(
        async (page: number, pageLimit: number = userPerPage) => {
            setCurrentPage(page);
            const pageOffset = (page - 1) * pageLimit;

            // Reset selections
            setSelected(new Set());
            setSelectedUser(null);
            setSelectedUserIndex(null);

            try {
                const data = await GetAllUsers(pageOffset, pageLimit);
                const filtered = applyFilters(data);

                setUsers(filtered);
                setTotalUsers(filtered.length);
                setTotalPages(Math.ceil(filtered.length / pageLimit));
            } catch (error) {
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
            }
        },
        [userPerPage, applyFilters, fetchUsersErrorShown]
    );

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
            <Stack gap="md">
                <Flex mih={50} gap="xl" justify="flex-start" align="center" direction="row" wrap="wrap">
                    <TextInput
                        placeholder="Search for users"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        size="md"
                        style={{ width: "400px" }}
                    />
                    <Flex ml="auto" gap="sm" align="center">
                        <ActionIcon
                            disabled={!userCtx.userPermissions?.includes("users:create")}
                            size="input-md"
                            variant="filled"
                            color="blue"
                            onClick={handleCreate}
                        >
                            <IconPlus size={18} />
                        </ActionIcon>
                        <ActionIcon size="input-md" variant="default" onClick={handleSearch}>
                            <IconSearch size={16} />
                        </ActionIcon>
                    </Flex>
                </Flex>

                <UserFilters
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    schoolFilter={schoolFilter}
                    setSchoolFilter={setSchoolFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    updateFilter={updateFilter}
                    setUpdateFilter={setUpdateFilter}
                    availableRoles={availableRoles}
                    availableSchools={availableSchools}
                    onFilterChange={() => fetchUsers(1)}
                />

                <Table highlightOnHover stickyHeader>
                    <TableThead>
                        <TableTr>
                            <TableTh>
                                <Group>
                                    <Checkbox
                                        checked={selected.size === users.length && users.length > 0}
                                        indeterminate={selected.size > 0 && selected.size < users.length}
                                        onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                                    />
                                    {selected.size > 0 && (
                                        <Menu shadow="md" width={200}>
                                            <Menu.Target>
                                                <Button variant="light" size="xs">
                                                    Actions ({selected.size})
                                                </Button>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Label>Bulk Actions</Menu.Label>
                                                <Menu.Item
                                                    leftSection={<IconUserOff size={14} />}
                                                    onClick={() => handleBulkAction("deactivate")}
                                                >
                                                    Deactivate Users
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconUserCheck size={14} />}
                                                    onClick={() => handleBulkAction("reactivate")}
                                                >
                                                    Reactivate Users
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    )}
                                </Group>
                            </TableTh>
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
                        {users.length > 0 ? (
                            users.map((user, index) => (
                                <TableTr
                                    key={index}
                                    bg={selected.has(index) ? "gray.1" : undefined}
                                    // onMouseEnter={() => setHoveredUser(user)}
                                    // onMouseLeave={() => setHoveredUser(null)}
                                >
                                    {/* Checkbox and Avatar */}
                                    <TableTd>
                                        <Group>
                                            <Checkbox
                                                checked={selected.has(index)}
                                                onChange={() => toggleSelected(index)}
                                            />
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
                                                <Anchor
                                                    href={`mailto:${user.email}`}
                                                    underline="never"
                                                    size="sm"
                                                    rel="noopener noreferrer"
                                                >
                                                    {user.email}
                                                </Anchor>
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
                                            {user.deactivated ? (
                                                <IconLock color="gray" />
                                            ) : (
                                                <IconLockOpen color="green" />
                                            )}
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
                            ))
                        ) : (
                            <TableTr>
                                <TableTd colSpan={9}>
                                    <Text c="dimmed" size="sm" ta="center" py="xl">
                                        No users available
                                    </Text>
                                </TableTd>
                            </TableTr>
                        )}
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
                                            <Text fw={ 500}>
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
                <Group justify="space-between" align="center" m="md">
                    <div></div>
                    <Stack align="center" justify="center" gap="sm">
                        <Pagination value={currentPage} onChange={fetchUsers} total={totalPages} mt="md" />
                        <Text size="sm" c="dimmed">
                            {totalUsers > 0
                                ? `${(currentPage - 1) * userPerPage + 1}-${Math.min(
                                      currentPage * userPerPage,
                                      totalUsers
                                  )} of ${totalUsers} users`
                                : "No users found"}
                        </Text>
                    </Stack>
                    <Select
                        value={userPerPage.toString()}
                        onChange={async (value) => {
                            if (value) {
                                console.debug("Changing users per page to", value);
                                const newUserPerPage = parseInt(value);
                                setUserPerPage(newUserPerPage);
                                // Reset to page 1 and fetch users with new page size
                                await fetchUsers(1, newUserPerPage);
                            }
                        }}
                        data={userPerPageOptions.map((num) => ({ value: num.toString(), label: num.toString() }))}
                        size="md"
                        style={{ width: "100px" }}
                        allowDeselect={false}
                    />
                </Group>
                {selectedUserIndex !== null && selectedUser !== null && (
                    <EditUserComponent
                        index={selectedUserIndex}
                        user={selectedUser}
                        availableSchools={availableSchools}
                        availableRoles={availableRoles}
                        currentPage={currentPage}
                        setIndex={setSelectedUserIndex}
                        fetchUsers={fetchUsers}
                        UpdateUserInfo={UpdateUserInfo}
                        UploadUserAvatar={UploadUserAvatar}
                        fetchUserAvatar={fetchUserAvatar}
                    />
                )}
                {openCreateUserModal === true && (
                    <CreateUserComponent
                        modalOpen={openCreateUserModal}
                        setModalOpen={setOpenCreateUserModal}
                        fetchUsers={fetchUsers}
                        currentPage={currentPage}
                        availableSchools={availableSchools}
                        availableRoles={availableRoles}
                        UpdateUserInfo={UpdateUserInfo}
                    />
                )}
            </Stack>
        </>
    );
}
