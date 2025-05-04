"use client";

import { Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function rootContent() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <Flex></Flex>
    );
}