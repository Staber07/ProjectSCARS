import { memo } from "react";
import { Card, Container, Title, Text, SimpleGrid, Button, Group, Timeline } from "@mantine/core";
import { IconServer, IconShield, IconChartBar, IconBook, IconUsers } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";

const FeatureCard = memo(
    ({ icon: Icon, title, description }: { icon: typeof IconServer; title: string; description: string }) => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                    <Icon size={24} color="var(--mantine-color-blue-6)" />
                    <Title order={4}>{title}</Title>
                </Group>
                <Text size="sm" c="dimmed">
                    {description}
                </Text>
            </Card>
        </motion.div>
    )
);

FeatureCard.displayName = "FeatureCard";

const features = [
    {
        icon: IconServer,
        title: "Asset Management",
        description: "Track and manage school resources efficiently with our comprehensive asset management system.",
    },
    {
        icon: IconShield,
        title: "Secure System",
        description: "Enhanced security measures to protect sensitive school data and financial information.",
    },
    {
        icon: IconChartBar,
        title: "Analytics Dashboard",
        description: "Real-time insights and reporting tools for better decision-making.",
    },
];

const timelineData = [
    {
        title: "Track Assets",
        description: "Monitor and manage all school assets in real-time",
        icon: IconServer,
    },
    {
        title: "Generate Reports",
        description: "Create comprehensive financial and asset reports",
        icon: IconBook,
    },
    {
        title: "Collaborate",
        description: "Work together with your team efficiently",
        icon: IconUsers,
    },
];

export const HomeSection = memo(() => {
    return (
        <Container size="xl" mt={50}>
            {/* Hero Section */}
            <Card shadow="sm" p="xl" radius="md" withBorder mb={50}>
                <Group align="flex-start" style={{ gap: 50 }}>
                    <div style={{ flex: 1 }}>
                        <Title mb="md">School Capital Asset Recording System</Title>
                        <Text size="lg" c="dimmed" mb="xl">
                            Streamline your school's asset management with our comprehensive digital solution. Track,
                            manage, and report on all your institution's resources in one place.
                        </Text>
                        <Button
                            component="a"
                            href="/documentation"
                            size="md"
                            variant="gradient"
                            gradient={{ from: "blue", to: "cyan" }}
                        >
                            Learn More
                        </Button>
                    </div>
                    <div style={{ position: "relative", width: 400, height: 300 }}>
                        <Image
                            src="/dashboard-hero.svg"
                            alt="Dashboard Hero"
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                        />
                    </div>
                </Group>
            </Card>

            {/* Features Section */}
            <Title order={2} ta="center" mb="xl">
                Key Features
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </SimpleGrid>

            {/* How It Works Section */}
            <Card shadow="sm" p="xl" radius="md" withBorder mt={50}>
                <Title order={2} ta="center" mb="xl">
                    How It Works
                </Title>
                <Timeline active={-1} bulletSize={24} lineWidth={2}>
                    {timelineData.map((item, index) => (
                        <Timeline.Item key={index} bullet={<item.icon size={12} />} title={item.title}>
                            <Text size="sm" mt={4}>
                                {item.description}
                            </Text>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Card>
        </Container>
    );
});

HomeSection.displayName = "HomeSection";
