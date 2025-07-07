"use client";

import { Box, Card, Divider, Group, ScrollArea, SimpleGrid, Text, Title } from "@mantine/core";
import { IconBook, IconBuilding, IconCertificate, IconSchool, IconUser, IconUsers } from "@tabler/icons-react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const sampleData = [
    {
        school: "School A",
        sales: 120000,
        purchases: 70000,
        netIncome: 30000,
        operationalCosts: 15000,
        administrationCosts: 5000,
        otherExpenses: 10000,
    },
    {
        school: "School B",
        sales: 95000,
        purchases: 60000,
        netIncome: 20000,
        operationalCosts: 12000,
        administrationCosts: 4000,
        otherExpenses: 8000,
    },
    {
        school: "School C",
        sales: 80000,
        purchases: 45000,
        netIncome: 18000,
        operationalCosts: 10000,
        administrationCosts: 3500,
        otherExpenses: 6500,
    },
    {
        school: "School D",
        sales: 110000,
        purchases: 65000,
        netIncome: 25000,
        operationalCosts: 14000,
        administrationCosts: 4500,
        otherExpenses: 9500,
    },
];

export default function SchoolStatisticsPage() {
    // Since the new sampleData only has financial fields, update the statistics accordingly
    const totalSchools = sampleData.length;
    const totalSales = sampleData.reduce((sum, s) => sum + s.sales, 0);
    const totalPurchases = sampleData.reduce((sum, s) => sum + s.purchases, 0);
    const totalNetIncome = sampleData.reduce((sum, s) => sum + s.netIncome, 0);
    const avgOperationalCosts = (
        sampleData.reduce((sum, s) => sum + s.operationalCosts, 0) / sampleData.length
    ).toFixed(2);
    const avgAdministrationCosts = (
        sampleData.reduce((sum, s) => sum + s.administrationCosts, 0) / sampleData.length
    ).toFixed(2);
    const avgOtherExpenses = (sampleData.reduce((sum, s) => sum + s.otherExpenses, 0) / sampleData.length).toFixed(2);

    return (
        <Box p="lg">
            <Group justify="space-between" mb="lg">
                <Title order={3}>School Financial Statistics</Title>
            </Group>

            <Divider my="md" />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mb="lg">
                <Card withBorder>
                    <Group>
                        <IconSchool />
                        <Text fw={700}>Total Schools: {totalSchools}</Text>
                    </Group>
                </Card>
                <Card withBorder>
                    <Group>
                        <IconBook />
                        <Text fw={700}>Total Sales: {totalSales.toLocaleString()}</Text>
                    </Group>
                </Card>
                <Card withBorder>
                    <Group>
                        <IconBook />
                        <Text fw={700}>Total Purchases: {totalPurchases.toLocaleString()}</Text>
                    </Group>
                </Card>
                <Card withBorder>
                    <Group>
                        <IconCertificate />
                        <Text fw={700}>Total Net Income: {totalNetIncome.toLocaleString()}</Text>
                    </Group>
                </Card>
                <Card withBorder>
                    <Group>
                        <IconBuilding />
                        <Text fw={700}>Avg Operational Costs: {avgOperationalCosts}</Text>
                    </Group>
                </Card>
                <Card withBorder>
                    <Group>
                        <IconUser />
                        <Text fw={700}>Avg Administration Costs: {avgAdministrationCosts}</Text>
                    </Group>
                </Card>
                <Card withBorder>
                    <Group>
                        <IconUsers />
                        <Text fw={700}>Avg Other Expenses: {avgOtherExpenses}</Text>
                    </Group>
                </Card>
            </SimpleGrid>

            <ScrollArea h={400}>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={sampleData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="school" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                        <Bar dataKey="purchases" fill="#82ca9d" name="Purchases" />
                        <Bar dataKey="netIncome" fill="#ffc658" name="Net Income" />
                        <Bar dataKey="operationalCosts" fill="#ff8042" name="Operational Costs" />
                        <Bar dataKey="administrationCosts" fill="#8dd1e1" name="Administration Costs" />
                        <Bar dataKey="otherExpenses" fill="#a4de6c" name="Other Expenses" />
                    </BarChart>
                </ResponsiveContainer>
            </ScrollArea>
        </Box>
    );
}
