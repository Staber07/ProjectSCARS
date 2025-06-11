"use client";
import { CreateUser } from "@/lib/api/auth";
import { RoleType, SchoolType, UserPublicType, UserUpdateType } from "@/lib/types";
import { Button, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconUserCheck, IconUserExclamation } from "@tabler/icons-react";
import { useState } from "react";

interface CreateUserComponentProps {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    fetchUsers: (page: number) => void;
    currentPage: number;
    availableSchools: SchoolType[];
    availableRoles: RoleType[];
    UpdateUserInfo: (user: UserUpdateType) => Promise<UserPublicType>;
}

export function CreateUserComponent({
    modalOpen,
    setModalOpen,
    fetchUsers,
    currentPage,
    availableSchools,
    availableRoles,
    UpdateUserInfo,
}: CreateUserComponentProps) {
    const [createUserFirstName, setCreateUserFirstName] = useState("");
    const [createUserMiddleName, setCreateUserMiddleName] = useState<string | null>("");
    const [createUserLastName, setCreateUserLastName] = useState("");
    const [createUserEmail, setCreateUserEmail] = useState("");
    const [createUserPassword, setCreateUserPassword] = useState("");
    const [createUserUsername, setCreateUserUsername] = useState("");
    const [createUserAssignedSchool, setCreateUserAssignedSchool] = useState<number | null>(null);
    const [createUserRole, setCreateUserRole] = useState<number | null>();
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);

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
                nameFirst: createUserFirstName,
                nameMiddle: createUserMiddleName,
                nameLast: createUserLastName,
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
            setModalOpen(false);
            setCreateUserFirstName("");
            setCreateUserMiddleName("");
            setCreateUserLastName("");
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

    return (
        <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add New User">
            <Stack>
                <TextInput
                    label="First Name"
                    value={createUserFirstName}
                    onChange={(e) => setCreateUserFirstName(e.currentTarget.value)}
                />
                <TextInput
                    label="Middle Name"
                    value={createUserMiddleName || ""}
                    onChange={(e) => setCreateUserMiddleName(e.currentTarget.value)}
                />
                <TextInput
                    label="Last Name"
                    value={createUserLastName}
                    onChange={(e) => setCreateUserLastName(e.currentTarget.value)}
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
    );
}
