"use client";

import { Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Text, AppShell } from '@mantine/core';
import App from 'next/app';
import { Navbar } from '@/components/Navbar';

export default function rootContent() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <Text>rahh</Text>
    );
}