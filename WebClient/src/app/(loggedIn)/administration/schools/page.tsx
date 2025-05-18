"use client";

import {
  Table,
  Flex,
  ActionIcon,
  TextInput,
  Pagination,
  Group,
  Checkbox,
  ScrollArea,
} from "@mantine/core";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

// Mock data (20 rows for better pagination)
const SchoolsData = Array.from({ length: 20 }, (_, i) => [
  `School ${i + 1}`,
  `Barangay ${i + 1}, Baliuag, Bulacan`,
  1000 + i * 100,
  50 + i * 10,
  500 + i * 50,
]);

const ITEMS_PER_PAGE = 10;

export default function SchoolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activePage, setActivePage] = useState(1);

  // Filter and paginate data
  const filteredData = SchoolsData.filter((row) =>
    String(row[0]).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedData = filteredData.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  const handleSearch = () => setActivePage(1);

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setSelectedRows([]);
  };

  const handleSelectRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      <Flex mih={50} gap="xl" align="center" wrap="nowrap">
        <TextInput
          placeholder="Search for Schools"
          size="md"
          style={{ width: "400px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        <Flex ml="auto" gap="sm" align="center">
          <ActionIcon size="input-md" variant="default" onClick={toggleEditMode}>
            <IconEdit size={16} />
          </ActionIcon>

          <ActionIcon
            size="input-md"
            variant="default"
            aria-label="Search"
            onClick={handleSearch}
          >
            <IconSearch size={16} />
          </ActionIcon>
        </Flex>
      </Flex>

      <ScrollArea>
        <Table
          stickyHeader
          stickyHeaderOffset={60}
          verticalSpacing="sm"
          highlightOnHover
          withTableBorder
          style={{ marginTop: "10px", minWidth: "100%" }}
        >
          <Table.Thead>
            <Table.Tr>
              {editMode && <Table.Th></Table.Th>}
              <Table.Th>Schools</Table.Th>
              <Table.Th>Address</Table.Th>
              <Table.Th>Net Income</Table.Th>
              <Table.Th>Net Profit</Table.Th>
              <Table.Th>Gross Profit</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.map((row, index) => (
              <Table.Tr key={index}>
                {editMode && (
                  <Table.Td>
                    <Checkbox
                      checked={selectedRows.includes(index)}
                      onChange={() => handleSelectRow(index)}
                    />
                  </Table.Td>
                )}
                {row.map((cell, i) => (
                  <Table.Td key={i}>{cell}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Pagination.Root
        total={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
        value={activePage}
        onChange={setActivePage}
        style={{ marginTop: "20px" }}
      >
        <Group gap={10} justify="center">
          <Pagination.First />
          <Pagination.Previous />
          <Pagination.Items />
          <Pagination.Next />
          <Pagination.Last />
        </Group>
      </Pagination.Root>
    </div>
  );
}