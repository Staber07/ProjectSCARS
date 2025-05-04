"use client";

import { Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Text } from '@mantine/core';

export default function rootContent() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <Text>meow</Text>
    );
}