"use client";

import { Button, Text, Title, Stack, Center, Container, Code } from "@mantine/core";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div>
            <Container>
                <Center>
                    <Stack>
                        <Title>Uh oh!</Title>
                        <Text>An unexpected error occured: {error.message}</Text>
                        {error.digest && (
                            <Text style={{ fontSize: "xs", textEmphasis: "error" }}>
                                Error digest: <Code>{error.digest}</Code>
                            </Text>
                        )}
                        <Container style={{ display: "flex", gap: "1rem" }}>
                            <Button onClick={() => reset()}>Try again</Button>
                            <Button component={Link} href="/">
                                Go Back
                            </Button>
                        </Container>
                    </Stack>
                </Center>
            </Container>
        </div>
    );
}
