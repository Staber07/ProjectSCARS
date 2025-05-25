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
  Button,
  rem,
} from "@mantine/core";
import { IconEdit, IconSearch, IconTrash, IconDownload, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { useMemo, useState } from "react";

const SchoolsData = () => {
  const schools = [
    "Hinukay", "Pinagbarilan", "Calantipay", "Tilapayong", "Poblacion",
    "Subic", "Santa Barbara", "San Rafael", "San Jose", "Bagong Bayan",
    "San Isidro", "San Miguel", "Sto. Cristo", "Tiaong", "Tibag",
    "Tarcan", "Malolos", "Paombong", "Bustos", "Guiguinto"
  ];
  return schools.map((name, index) => ({
    id: index + 1,
    school: name,
    address: "Baliuag, Bulacan",
    netIncome: Math.floor(Math.random() * 10000),
    netProfit: Math.floor(Math.random() * 5000),
    grossProfit: Math.floor(Math.random() * 8000),
  }));
};

type SortKey = "school" | "netIncome";
type SortDirection = "asc" | "desc";

export default function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [data] = useState(SchoolsData());
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("school");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const rowsPerPage = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredData = useMemo(() => {
    let result = data.filter((row) =>
      row.school.toLowerCase().includes(search.toLowerCase())
    );
    result = [...result].sort((a, b) => {
      if (sortKey === "school") {
        if (sortDirection === "asc") {
          return a.school.localeCompare(b.school);
        } else {
          return b.school.localeCompare(a.school);
        }
      } else if (sortKey === "netIncome") {
        if (sortDirection === "asc") {
          return a.netIncome - b.netIncome;
        } else {
          return b.netIncome - a.netIncome;
        }
      }
      return 0;
    });
    return result;
  }, [search, data, sortKey, sortDirection]);

  const paginatedData = useMemo(
    () => filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredData, page]
  );

  const toggleSelection = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const csvContent = [
      ["School", "Address", "Net Income", "Net Profit", "Gross Profit"],
      ...filteredData.map(row => [
        row.school,
        row.address,
        row.netIncome,
        row.netProfit,
        row.grossProfit,
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "schools_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Flex mih={50} gap="xl" justify="flex-start" align="center" direction="row" wrap="nowrap">
        <TextInput
          placeholder="Search for Schools"
          size="md"
          style={{ width: "400px" }}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <Flex ml="auto" gap="sm" align="center">
          <ActionIcon size="input-md" variant="default" onClick={() => setEditMode((v) => !v)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="input-md" variant="default" onClick={handleExport}>
            <IconDownload size={16} />
          </ActionIcon>
          <ActionIcon size="input-md" variant="default">
            <IconSearch size={16} />
          </ActionIcon>
        </Flex>
      </Flex>

      {editMode && (
        <Group mt="md">
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            onClick={() => setSelected([])}
          >
            Clear Selection
          </Button>
        </Group>
      )}

      <ScrollArea style={{ marginTop: rem(20) }}>
        <Table stickyHeader stickyHeaderOffset={60} verticalSpacing="sm" highlightOnHover withTableBorder>
          <Table.Tr>
            {editMode && <Table.Th></Table.Th>}
            <Table.Th
              style={{ cursor: "pointer" }}
              onClick={() => handleSort("school")}
            >
              Schools{" "}
              {sortKey === "school" &&
                (sortDirection === "asc" ? (
                  <IconChevronUp size={14} style={{ verticalAlign: "middle" }} />
                ) : (
                  <IconChevronDown size={14} style={{ verticalAlign: "middle" }} />
                ))}
            </Table.Th>
            <Table.Th>Address</Table.Th>
            <Table.Th
              style={{ cursor: "pointer" }}
              onClick={() => handleSort("netIncome")}
            >
              Net Income{" "}
              {sortKey === "netIncome" &&
                (sortDirection === "asc" ? (
                  <IconChevronUp size={14} style={{ verticalAlign: "middle" }} />
                ) : (
                  <IconChevronDown size={14} style={{ verticalAlign: "middle" }} />
                ))}
            </Table.Th>
            <Table.Th>Net Profit</Table.Th>
            <Table.Th>Gross Profit</Table.Th>
          </Table.Tr>
          <Table.Tbody>
            {paginatedData.map((row) => (
              <Table.Tr key={row.id}>
                {editMode && (
                  <Table.Td>
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelection(row.id)}
                    />
                  </Table.Td>
                )}
                <Table.Td>{row.school}</Table.Td>
                <Table.Td>{row.address}</Table.Td>
                <Table.Td>{row.netIncome}</Table.Td>
                <Table.Td>{row.netProfit}</Table.Td>
                <Table.Td>{row.grossProfit}</Table.Td>
              </Table.Tr>
            ))}

            {paginatedData.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={editMode ? 6 : 5} align="center">
                  No schools found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Pagination.Root total={Math.ceil(filteredData.length / rowsPerPage)} value={page} onChange={setPage} style={{ marginTop: "20px" }}>
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