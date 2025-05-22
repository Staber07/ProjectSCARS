"use client";

import { Button, Text, Title, Center, Stack, Container } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <Container style={{ paddingTop: "150px" }}>
            <Center>
                <Stack>
                    <Title>Page Not Found</Title>
                    <Text>The page you are looking for does not exist.</Text>
                    <Container style={{ display: "flex", gap: "1rem" }}>
                        <Button onClick={() => router.back()}>Go Back</Button>
                        <Button component={Link} href="/">
                            Go Home
                        </Button>
                    </Container>
                </Stack>
            </Center>
        </Container>
    );
}
