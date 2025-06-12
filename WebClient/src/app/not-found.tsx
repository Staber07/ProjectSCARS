"use client";

import { animationConfig } from "@/lib/anim";
import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { IconArrowBack, IconError404, IconHome } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    return (
        <Container>
            <Center style={{ height: "100vh" }}>
                <Stack align="center">
                    <IconError404 size={128} />
                    <Title>Page Not Found</Title>
                    <Text>The page you are looking for does not exist.</Text>
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
                            onClick={() => router.push("/")}
                            rightSection={<IconHome />}
                            component={motion.button}
                            transition={animationConfig.button.transition}
                            whileHover={animationConfig.button.whileHover}
                            whileTap={animationConfig.button.whileTap}
                        >
                            Go Home
                        </Button>
                    </Container>
                </Stack>
            </Center>
        </Container>
    );
}
