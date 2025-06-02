"use client";

import { useState } from "react";

import {
  Anchor,
  Badge,
  Flex,
  Group,
  Menu,
  Pagination,
  Table,
  Text,
  TextInput,
  Title,
  ActionIcon
} from "@mantine/core";
import { IconDots, IconEye, IconPencil, IconSearch, IconTrash } from "@tabler/icons-react";
import { ExpenseButtonMenu } from "@/components/ExpenseButton";

// sample reports
const reportSubmissions = [
  {
    name: "May Financial Report",
    lastModified: "2025-05-23T09:20:00Z",
    status: "Pending Approval",
  },
  {
    name: "May Administrative Expenses",
    lastModified: "2025-05-20T10:30:00Z",
    status: "Pending Approval",
  },
  {
    name: "April Operating Expenses",
    lastModified: "2025-04-29T13:00:00Z",
    status: "Approved",
  },
  {
    name: "April Supplementary Feeding Fund Report",
    lastModified: "2025-04-29T12:50:00Z",
    status: "Approved",
  },
  {
    name: "April HE Fund Report",
    lastModified: "2025-04-29T12:50:00Z",
    status: "Rejected",
  },
];

export default function ReportsPage() {
    console.debug("Rendering ReportsPage");

    const [search, setSearch] = useState("");

    const filteredReports = reportSubmissions.filter((report) =>
      report.name.toLowerCase().includes(search.toLowerCase())
    );


    const rows = filteredReports.map((row) => (
      <Table.Tr key={row.name}>
        <Table.Td>
          <Anchor component="button" fz="sm">
            {row.name}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Text c="dimmed" fz="sm">
            {new Date(row.lastModified).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }).replace(',', '')}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge
            color={
              row.status === "Approved"
                ? "green"
                : row.status === "Pending Approval"
                ? "yellow"
                : row.status === "Rejected"
                ? "red"
                : "gray"
            }
            variant="filled"
          >
            {row.status}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />}>Preview</Menu.Item>
              <Menu.Item leftSection={<IconPencil size={14} />}>Edit</Menu.Item>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    ));

    return (
      <>
        <Title order={2}>Reports</Title>

        <Flex
          mih={50}
          gap="md"
          justify="space-between"
          align="center"
          direction="row"
          wrap="wrap"
          mt="lg"
        >
        <TextInput
          placeholder="Search reports..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={300}
        />
          <ExpenseButtonMenu />
        </Flex>

        <Table mt="lg">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Last Modified</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        <Group justify="center">
          <Pagination total={1} mt="md" />
        </Group>
      </>
    );
  }
