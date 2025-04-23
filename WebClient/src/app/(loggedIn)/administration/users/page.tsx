"use client";

import { AppShell, Burger, Skeleton, Center, Group, keys, ScrollArea, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Table, Avatar } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from '@tabler/icons-react';


export default function rootContent() {
  const [opened, { toggle }] = useDisclosure();
  const tableData: TableData = {
    caption: 'Some elements from periodic table',
    head: ['', 'Element position', 'Atomic mass', 'Symbol', 'Element name'],
    body: [
      [<Avatar />, 6, 12.011, 'C', 'Carbon'],
      [<Avatar />, 7, 14.007, 'N', 'Nitrogen'],
      [<Avatar />, 39, 88.906, 'Y', 'Yttrium'],
      [<Avatar />, 56, 137.33, 'Ba', 'Barium'],
      [<Avatar />, 58, 140.12, 'Ce', 'Cerium'],
    ],
  };

  interface RowData {
    name: string;
    email: string;
    company: string;
  }
  
  interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort: () => void;
  }
  
  function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
      <Table.Th className={classes.th}>
        <UnstyledButton onClick={onSort} className={classes.control}>
          <Group justify="space-between">
            <Text fw={500} fz="sm">
              {children}
            </Text>
            <Center className={classes.icon}>
              <Icon size={16} stroke={1.5} />
            </Center>
          </Group>
        </UnstyledButton>
      </Table.Th>
    );
  }
  
  function filterData(data: RowData[], search: string) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
    );
  }
  
  function sortData(
    data: RowData[],
    payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
  ) {
    const { sortBy } = payload;
  
    if (!sortBy) {
      return filterData(data, payload.search);
    }
  
    return filterData(
      [...data].sort((a, b) => {
        if (payload.reversed) {
          return b[sortBy].localeCompare(a[sortBy]);
        }
  
        return a[sortBy].localeCompare(b[sortBy]);
      }),
      payload.search
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        header
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        guard
        {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <TextInput>
          placeholder="Search by any field"
          mb="md"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={search}
          onChange={handleSearchChange}
        </TextInput>
        <Table stickyHeader stickyHeaderOffset={60} horizontalSpacing={"sm"} verticalSpacing={"sm"} highlightOnHover data={tableData} />
      </AppShell.Main>

    </AppShell>
  );
}