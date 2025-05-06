"use client";

import { Group, TextInput, ActionIcon, Flex, Pagination } from "@mantine/core";
import { Table, TableData } from "@mantine/core";
import { Avatar } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export default function UsersPage() {
  const tableData: TableData = {
    caption: "Some elements from periodic table",
    head: ["", "Element position", "Atomic mass", "Symbol", "Element name"],
    body: [
      [<Avatar key="C" />, 6, 12.011, "C", "Carbon"],
      [<Avatar key="N" />, 7, 14.007, "N", "Nitrogen"],
      [<Avatar key="Y" />, 39, 88.906, "Y", "Yttrium"],
      [<Avatar key="Ba" />, 56, 137.33, "Ba", "Barium"],
      [<Avatar key="Ce" />, 58, 140.12, "Ce", "Cerium"],
    ],
  };

  console.debug("Rendering UsersPage");
  return (
    <div>
      <Flex
        mih={50}
        gap="xl"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="nowrap"
      >
        <TextInput
          placeholder="Search for users"
          size="md"
          style={{ width: "400px" }}
        />
        <ActionIcon
          style={{ marginLeft: "300px" }}
          size="input-md"
          variant="default"
          aria-label="ActionIcon the same size as inputs"
        >
          {<IconSearch size={16} />}
        </ActionIcon>
      </Flex>
      <Table
        stickyHeader
        stickyHeaderOffset={60}
        horizontalSpacing={"sm"}
        verticalSpacing={"sm"}
        highlightOnHover
        data={tableData}
      />

      <Pagination.Root total={10}>
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
