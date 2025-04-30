"use client";

import { AppShell, Burger, Skeleton, Center, Group, keys, ScrollArea, Text, TextInput, UnstyledButton, AppShellNavbar, AppShellMain } from '@mantine/core';
//import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
//import { Table, Avatar } from '@mantine/core';
//import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from '@tabler/icons-react';


export default function rootContent() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell>
            <AppShell.Header>

            </AppShell.Header>

            <AppShellNavbar>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
            </AppShellNavbar>

            <AppShellMain>


            </AppShellMain>
        </AppShell>
    );
}