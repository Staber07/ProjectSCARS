"use client";

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function rootContent() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell>
            
        </AppShell>
    );
}