"use client";

import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { TextInput } from '@mantine/core';
import { ActionIcon } from '@mantine/core';
//import { IconSearch } from '@tabler/icons-react';

import { Flex } from '@mantine/core';


export default function rootContent() {
  const [opened, { toggle }] = useDisclosure();

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
        <Flex
          mih={50}
          //bg="rgba(255, 255, 255, 0.3)"
          gap="md"
          justify="flex-start"
          align="flex-start"
          direction="row"
          wrap="wrap"
        >
          <TextInput
            variant="filled"
            label="Search"
            placeholder=""
          />

          <ActionIcon
            variant="gradient"
            size="xl"
            aria-label="Gradient action icon"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          >
          </ActionIcon>
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}