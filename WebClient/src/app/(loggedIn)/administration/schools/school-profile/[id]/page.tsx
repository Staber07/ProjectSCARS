"use client";

import { Text, ActionIcon, Box } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter, useParams } from "next/navigation";

export default function SchoolProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    console.debug("Rendering SchoolProfilePage");
    
    return (
        <>
            <Box
                mb="md"
                px="xs"
                py={10}
                style={{
                    boxShadow: `0 3px 4px -1px rgba(0, 0, 0, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <ActionIcon
                    variant="transparent"
                    onClick={() => router.back()}
                    mr="sm"
                    style={{
                        color: 'black',
                    }}
                >
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <Text size="xl" fw={500}>
                    School Profile
                </Text>
            </Box>

            <Text>Viewing profile for school ID: {id}</Text>
        </>
    );
}
