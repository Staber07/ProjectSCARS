"use client";

import { animationConfig } from "@/lib/anim";
import { Button, Center, Code, Container, Stack, Text, Title } from "@mantine/core";
import { IconArrowBack, IconMoodSadSquint, IconReload } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
    error: Error & { digest?: string }; // The error object can include a digest for debugging
    reset: () => void; // Function to reset the error state
}

/**
 * ErrorPage component to display when an error occurs in the application.
 * It provides a user-friendly message and options to retry or go back.
 * @param {ErrorPageProps} props - The properties for the ErrorPage component.
 * @return {JSX.Element} The rendered ErrorPage component.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const router = useRouter();
    return (
        <Container>
            <Center style={{ height: "100vh" }}>
                <Stack align="center">
                    <IconMoodSadSquint size={128} />
                    <Title order={1} style={{ textAlign: "center" }}>
                        Uh oh!
                    </Title>
                    <Text>
                        An unexpected error occurred: <Code>{error.message}</Code>
                    </Text>
                    <Text>Please try again later or contact support if the issue persists.</Text>
                    {error.digest && (
                        <Text style={{ fontSize: "xs", textEmphasis: "error" }}>
                            Error digest: <Code>{error.digest}</Code>
                        </Text>
                    )}
                    <Container style={{ display: "flex", gap: "1rem" }}>
                        <Button
                            variant="light"
                            onClick={() => router.back()}
                            leftSection={<IconArrowBack />}
                            component={motion.button}
                            transition={animationConfig.button.transition}
                            whileHover={animationConfig.button.whileHover}
                            whileTap={animationConfig.button.whileTap}
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={() => reset()}
                            rightSection={<IconReload />}
                            component={motion.button}
                            transition={animationConfig.button.transition}
                            whileHover={animationConfig.button.whileHover}
                            whileTap={animationConfig.button.whileTap}
                        >
                            Try again
                        </Button>
                    </Container>
                </Stack>
            </Center>
        </Container>
    );
}
