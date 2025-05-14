"use client";

import {
  Group,
  TextInput,
  ActionIcon,
  Flex,
  Pagination,
  Avatar,
  Table,
  TableTbody,
  TableThead,
  TableTr,
  TableTh,
  TableTd,
  Checkbox,
  Modal,
  Button,
  TextInput as MantineInput,
} from "@mantine/core";
import { IconSearch, IconEdit } from "@tabler/icons-react";
import { useState } from "react";

interface User {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  avatarKey: string;
}

const initialUsers: User[] = [
  { firstName: "Chie", middleName: "12.011", lastName: "C", email: "Carbon", contactNumber: "0912-345-6789", address: "C St.", avatarKey: "C" },
  { firstName: "Cheese", middleName: "14.007", lastName: "N", email: "Nitrogen", contactNumber: "0912-345-6789", address: "N Ave", avatarKey: "N" },
  { firstName: "Ara", middleName: "88.906", lastName: "Y", email: "Yttrium", contactNumber: "0912-345-6789", address: "Y Blvd", avatarKey: "Y" },
  { firstName: "Andrew", middleName: "137.33", lastName: "Ba", email: "Barium", contactNumber: "0912-345-6789", address: "Ba St.", avatarKey: "Ba" },
  { firstName: "Meow", middleName: "140.12", lastName: "Ce", email: "Cerium", contactNumber: "0912-345-6789", address: "Ce Lane", avatarKey: "Ce" },
  { firstName: "Sam", middleName: "1.008", lastName: "H", email: "Hydrogen", contactNumber: "0912-345-6789", address: "H St.", avatarKey: "H" },
  { firstName: "Liam", middleName: "15.999", lastName: "O", email: "Oxygen", contactNumber: "0912-345-6789", address: "O St.", avatarKey: "O" },
  { firstName: "Noah", middleName: "55.845", lastName: "Fe", email: "Iron", contactNumber: "0912-345-6789", address: "Fe Lane", avatarKey: "Fe" },
  { firstName: "Emma", middleName: "20.180", lastName: "Ne", email: "Neon", contactNumber: "0912-345-6789", address: "Ne Ave", avatarKey: "Ne" },
  { firstName: "Olivia", middleName: "24.305", lastName: "Mg", email: "Magnesium", contactNumber: "0912-345-6789", address: "Mg Blvd", avatarKey: "Mg" },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const handleSearch = () => {
    const filtered = initialUsers.filter((user) =>
      `${user.firstName} ${user.middleName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setUsers(filtered);
  };

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

  console.debug("Rendering UsersPage");

  return (
    <div>
      <Flex
        mih={50}
        gap="xl"
        justify="flex-start"
        align="center"
        direction="row"
        wrap="nowrap"
      >
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
            <TableTh>First Name</TableTh>
            <TableTh>Middle Name</TableTh>
            <TableTh>Last Name</TableTh>
            <TableTh>Email Address</TableTh>
            <TableTh>Contact Number</TableTh>
            <TableTh>Address</TableTh>
            <TableTh>Edit</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {users.map((user, index) => (
            <TableTr key={index} bg={selected.has(index) ? "gray.1" : undefined}>
              <TableTd>
                <Group>
                  <Checkbox
                    checked={selected.has(index)}
                    onChange={() => toggleSelected(index)}
                  />
                  <Avatar radius="xl" />
                </Group>
              </TableTd>
              <TableTd>{user.firstName}</TableTd>
              <TableTd>{user.middleName}</TableTd>
              <TableTd>{user.lastName}</TableTd>
              <TableTd>{user.email}</TableTd>
              <TableTd>{user.contactNumber}</TableTd>
              <TableTd>{user.address}</TableTd>
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

      <Modal
        opened={editIndex !== null}
        onClose={() => setEditIndex(null)}
        title="Edit User"
        centered
      >
        {editUser && (
          <Flex direction="column" gap="md">
            <MantineInput
              label="First Name"
              value={editUser.firstName}
              onChange={(e) =>
                setEditUser({ ...editUser, firstName: e.currentTarget.value })
              }
            />
            <MantineInput
              label="Middle Name"
              value={editUser.middleName}
              onChange={(e) =>
                setEditUser({ ...editUser, middleName: e.currentTarget.value })
              }
            />
            <MantineInput
              label="Last Name"
              value={editUser.lastName}
              onChange={(e) =>
                setEditUser({ ...editUser, lastName: e.currentTarget.value })
              }
            />
            <MantineInput
              label="Email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.currentTarget.value })
              }
            />
            <MantineInput
              label="Contact Number"
              value={editUser.contactNumber}
              onChange={(e) =>
                setEditUser({ ...editUser, contactNumber: e.currentTarget.value })
              }
            />
            <MantineInput
              label="Address"
              value={editUser.address}
              onChange={(e) =>
                setEditUser({ ...editUser, address: e.currentTarget.value })
              }
            />
            <Button onClick={handleSave}>Save</Button>
          </Flex>
        )}
      </Modal>
    </div>
  );
}
