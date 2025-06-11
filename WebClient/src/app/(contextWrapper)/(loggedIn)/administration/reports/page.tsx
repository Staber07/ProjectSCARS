"use client";

import { Accordion, ActionIcon, Button, Card, Flex, Group, Image, Text, TextInput } from "@mantine/core";
import { IconEdit, IconPlus, IconSearch } from "@tabler/icons-react";
import classes from "./accordion.module.css";

const groceries = [
    {
        emoji: "⚙️",
        value: "Operating Expenses",
        description:
            "These encompass the general costs associated with running the school canteen, such as salaries of personnel, utilities (water and electricity), supplies, and insurance.",
    },
    {
        emoji: "🗂️",
        value: "Administrative Expenses",
        description:
            "Administrative expenses refer to the overarching costs of business operations, including salaries, supplies, utility bills, insurance, and other general expenditures necessary for the canteen's functioning.",
    },
    {
        emoji: "🔁",
        value: "Revolving Fund",
        description:
            "This fund serves as the working capital for the canteen, ensuring continuous operations by covering the purchase of goods and other operational needs.",
    },
    {
        emoji: "🏫",
        value: "School Operation Fund",
        description:
            "Allocated 25% of the canteen's net income, this fund supports various school operational needs, including maintenance, minor repairs, and essential services.",
    },
    {
        emoji: "🩺",
        value: "Clinic Fund",
        description:
            "Designated 5% of the canteen's net income, this fund supports health-related services such as medical supplies and programs for student well-being.",
    },
    {
        emoji: "🧵",
        value: "HE Fund",
        description:
            "Receiving 10% of the canteen's net income, this fund enhances instructional materials and resources for Home Economics classes.",
    },
    {
        emoji: "👨‍🏫",
        value: "Faculty and Student Development Fund",
        description:
            "Allocated 15% of the canteen's net income, this fund supports the professional growth of teachers and holistic student development through training and educational activities.",
    },
    {
        emoji: "🥗",
        value: "Supplementary Feeding Fund",
        description:
            "This fund, comprising 35% of the canteen's net income, provides additional nutritious meals to undernourished pupils and students.",
    },
];

export default function ReportsPage() {
    console.debug("Rendering ReportsPage");

    const items = groceries.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Control icon={item.emoji}>{item.value}</Accordion.Control>
            <Accordion.Panel>{item.description}</Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <div>
            <Flex mih={50} gap="xl" justify="flex-start" align="center" direction="row" wrap="nowrap">
                <TextInput placeholder="Search for Schools" size="md" style={{ width: "400px" }} />

                <Flex ml="auto" gap="sm" align="center">
                    <ActionIcon size="input-md" variant="default">
                        <IconSearch size={16} />
                    </ActionIcon>

                    <ActionIcon size="input-md" variant="default" aria-label="ActionIcon the same size as inputs">
                        <IconEdit size={16} />
                    </ActionIcon>

                    <Button leftSection={<IconPlus size={16} />} variant="filled" color="green" size="md">
                        New
                    </Button>
                </Flex>
            </Flex>

            <Flex
                mih={50}
                gap="xl"
                justify="flex-start"
                align="center"
                direction="row"
                wrap="nowrap"
                style={{ marginTop: "10px" }}
            >
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section component="a" href="https://mantine.dev/">
                        <Image
                            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                            height={160}
                            alt="Liquidation Report"
                        />
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500}>Liquidation Report</Text>
                    </Group>

                    <Text size="sm" c="dimmed">
                        This report provides a detailed summary of expenses and revenues associated with the
                        project/event, outlining all financial transactions to ensure transparency and proper
                        accountability during the liquidation process.
                    </Text>

                    <Button color="blue" fullWidth mt="md" radius="md">
                        Create Liquidation Report
                    </Button>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section component="a" href="https://mantine.dev/">
                        <Image
                            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                            height={160}
                            alt="Payroll Report"
                        />
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500}>Payroll</Text>
                    </Group>

                    <Text size="sm" c="dimmed">
                        This report summarizes employee compensation for the covered period, including salaries,
                        deductions, benefits, and net pay, ensuring accurate and transparent payroll processing.
                    </Text>

                    <Button color="blue" fullWidth mt="md" radius="md">
                        Create Payroll
                    </Button>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section component="a" href="https://mantine.dev/">
                        <Image
                            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                            height={160}
                            alt="Disbursement Sheet"
                        />
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500}>Disbursement Voucher</Text>
                    </Group>

                    <Text size="sm" c="dimmed">
                        This voucher documents the release of funds for authorized expenses, detailing the purpose,
                        amount, payee, and supporting approvals to ensure proper financial accountability.
                    </Text>

                    <Button color="blue" fullWidth mt="md" radius="md">
                        Create Disbursement Voucher
                    </Button>
                </Card>
            </Flex>

            <Accordion
                style={{ marginTop: "20px" }}
                defaultValue="Apples"
                classNames={{ chevron: classes.chevron }}
                chevron={<IconPlus className={classes.icon} />}
            >
                {items}
            </Accordion>
        </div>
    );
}
