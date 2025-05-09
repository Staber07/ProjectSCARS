"use client";

import { Table, Flex, ActionIcon, TextInput, Pagination, Group } from "@mantine/core";
import { IconEdit, IconSearch } from "@tabler/icons-react";


const tableData = {
  //caption: 'Different Schools in Baliuag Division',
  head: ['Schools', 'Address', 'Net Income', 'Net Profit', 'Gross Profit'],
  body: [
    ['Hinukay', 'Baliuag, Bulacan', 3000, 100, 2000],
    ['Pinagbarilan', 'Baliuag, Bulacan', 5000, 400, 1000],
    ['Calantipay', 'Baliuag, Bulacan', 6000, 500, 1000],
    ['Tilapayong', 'Baliuag, Bulacan', 6000, 400, 1000],
    ['Poblacion', 'Baliuag, Bulacan', 100, 100, 2000],
  ],
};

export default function SchoolsPage() {
  console.debug("Rendering SchoolsPage");

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
          placeholder="Search for Schools"
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
        verticalSpacing={"sm"}
        highlightOnHover
        withTableBorder
        data={tableData}
        style={{
          marginTop: "10px",}}
      />

      <Pagination.Root total={10} style={{ marginTop: "20px" }}>
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
