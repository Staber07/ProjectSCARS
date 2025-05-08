"use client";

import { Group, TextInput, ActionIcon, Flex, Pagination, Avatar, ScrollArea } from "@mantine/core";
import { Table, TableData } from "@mantine/core";
import { IconSearch, IconEdit } from "@tabler/icons-react";

export default function UsersPage() {
  const tableData: TableData = {
    head: ["", "First Name", "Middle Name", "Last Name", "Email Address", "Contact Number", "Address"],
    body: [
      [<Avatar key="C" />, "Chie", 12.011, "C", "Carbon"],
      [<Avatar key="N" />, "Cheese", 14.007, "N", "Nitrogen"],
      [<Avatar key="Y" />, "Ara", 88.906, "Y", "Yttrium"],
      [<Avatar key="Ba" />, "Andrew", 137.33, "Ba", "Barium"],
      [<Avatar key="Ce" />, "Meow", 140.12, "Ce", "Cerium"],
      [<Avatar key="H" />, "Sam", 1.008, "H", "Hydrogen"],
      [<Avatar key="O" />, "Liam", 15.999, "O", "Oxygen"],
      [<Avatar key="Fe" />, "Noah", 55.845, "Fe", "Iron"],
      [<Avatar key="Ne" />, "Emma", 20.180, "Ne", "Neon"],
      [<Avatar key="Mg" />, "Olivia", 24.305, "Mg", "Magnesium"],
    ],
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
          size="md"
          style={{ width: "400px" }}
        />

        <Flex ml="auto" gap="sm" align="center">
          <ActionIcon size="input-md" variant="default">
            <IconEdit size={16} />
          </ActionIcon>

          <ActionIcon
            size="input-md"
            variant="default"
            aria-label="ActionIcon the same size as inputs"
          >
            <IconSearch size={16} />
          </ActionIcon>
        </Flex>
      </Flex>

      <Table
        stickyHeader
        stickyHeaderOffset={60}
        horizontalSpacing={"sm"}
        verticalSpacing={"sm"}
        highlightOnHover
        style={{ height: "500px", width: "100%" }}
        data={tableData}
      />


      <Pagination.Root total={10}>
        <Group gap={10} justify="center" style={{ marginTop: "10px" }}>
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
