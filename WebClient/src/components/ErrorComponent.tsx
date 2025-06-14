import { Center, Container, Stack, Title, Text, Code, Button } from "@mantine/core";
import { IconMoodSadSquint, IconArrowBack } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { IconReload } from "@tabler/icons-react";
import { animationConfig } from "@/lib/anim";

interface ErrorComponentProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export function ErrorComponent({ error, reset }: ErrorComponentProps): React.ReactElement {
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
