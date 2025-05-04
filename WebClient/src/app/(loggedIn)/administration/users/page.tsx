"use client";

import { AppShell, Burger, Skeleton, Group, TextInput, ActionIcon, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Table, TableData } from '@mantine/core';
import { Avatar } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';


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

  return (
    <AppShell
    //header={{ height: 60 }}
    //navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    //padding="md"
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
            style={{ width: '400px' }}
          />
          <ActionIcon
            style={{ marginLeft: '300px' }}
            size="input-md"
            variant="default"
            aria-label="ActionIcon the same size as inputs">
            {<IconSearch size={16} />}
          </ActionIcon>
        </Flex>
        <Table
          stickyHeader
          stickyHeaderOffset={60}
          horizontalSpacing={"sm"}
          verticalSpacing={"sm"}
          highlightOnHover
          data={tableData} />
      </AppShell.Main>

    </AppShell>
  );
}