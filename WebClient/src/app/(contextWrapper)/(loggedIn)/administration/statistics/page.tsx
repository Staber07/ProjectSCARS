"use client";

import { AreaChart, BarChart, LineChart, PieChart } from "@mantine/charts";
import { Card, Divider, Grid, Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconCoin,
    IconDiscount2,
    IconReceipt2,
    IconUserPlus,
} from "@tabler/icons-react";

import classes from "./Stats.module.css";

import { getBestMonthData } from "./BestMonthData";
import { getCostOfSalesData } from "./CostOfSalesData";
import { getCostToSalesData } from "./CostToSalesData";
import { getExpensesBreakdownData } from "./ExpensesBreakdownData";
import { getExpenseToIncomeData } from "./ExpenseToIncomeData";
import { getGrossdata } from "./GrossProfitdata";
// import { getMonthlySummaryData } from "./MonthlySummaryData";
import { getNetIncomeData } from "./NetIncomeData";
import { getNetdata } from "./NetSalesdata";
import { getProfitMarginData } from "./ProfitMarginData";
import { getUtilizationData } from "./UtilizationData";
import { getYearlyComparisonData } from "./YearlyComparisonData";

const Netdata = getNetdata();
const Grossdata = getGrossdata();
const CostOfSalesData = getCostOfSalesData();
const ExpenseBreakdownData = getExpensesBreakdownData().map(
    (item: { name: string; value: number; color?: string }, idx: number) => ({
        ...item,
        color: item.color ?? ["blue.6", "red.6", "green.6", "yellow.6", "orange.6", "purple.6", "cyan.6"][idx % 7],
    })
);
const NetIncomeData = getNetIncomeData();
const UtilizationData = getUtilizationData().map((item: { name: string; value: number; color?: string }) => ({
    ...item,
    color: item.color ?? "blue.6",
}));
const ProfitMarginData = getProfitMarginData();
const CostToSalesData = getCostToSalesData();
const ExpenseToIncomeData = getExpenseToIncomeData();
const MonthlySummaryData = getMonthlySummaryData();
const YearlyComparisonData = getYearlyComparisonData();
const BestMonthData = getBestMonthData();

const icons = {
    user: IconUserPlus,
    discount: IconDiscount2,
    receipt: IconReceipt2,
    coin: IconCoin,
};

const TopStats = [
    { title: "Net Sales", icon: "receipt", value: "13,456", diff: 34 },
    { title: "Gross Profit", icon: "coin", value: "4,145", diff: -13 },
    { title: "Cost of Sales", icon: "discount", value: "745", diff: 18 },
    { title: "Net Income", icon: "user", value: "188", diff: -30 },
] as const;

export default function StatisticsPage() {
    const stats = TopStats.map((stat) => {
        const Icon = icons[stat.icon];
        const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

        return (
            <Paper withBorder p="md" radius="md" key={stat.title}>
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" className={classes.title}>
                        {stat.title}
                    </Text>
                    <Icon className={classes.icon} size={22} stroke={1.5} />
                </Group>
                <Group align="flex-end" gap="xs" mt={25}>
                    <Text className={classes.value}>{stat.value}</Text>
                    <Text c={stat.diff > 0 ? "teal" : "red"} fz="sm" fw={500} className={classes.diff}>
                        <span>{stat.diff}%</span>
                        <DiffIcon size={16} stroke={1.5} />
                    </Text>
                </Group>
                <Text fz="xs" c="dimmed" mt={7}>
                    Compared to previous month
                </Text>
            </Paper>
        );
    });

    return (
        <div className={classes.root}>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>

            <Divider my="lg" label="Core Financial Statistics" labelPosition="center" />

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Monthly Net Sales</Title>
                        <LineChart
                            h={300}
                            data={Netdata}
                            dataKey="date"
                            series={[{ name: "sales", color: "indigo.6" }]}
                        />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Monthly Net Sales</Title>
                        <LineChart
                            h={300}
                            data={Grossdata}
                            dataKey="date"
                            series={[{ name: "sales", color: "indigo.6" }]}
                        />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Cost of Sales + Gross Profit</Title>
                        <BarChart
                            h={300}
                            data={CostOfSalesData}
                            dataKey="month"
                            series={[
                                { name: "cost", color: "red.6" },
                                { name: "gross", color: "green.6" },
                            ]}
                        />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Expenses Breakdown</Title>
                        <PieChart h={300} data={ExpenseBreakdownData} />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Net Income from Operations</Title>
                        <AreaChart
                            h={300}
                            data={NetIncomeData}
                            dataKey="month"
                            series={[{ name: "net", color: "blue.6" }]}
                        />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Utilization of Net Income</Title>
                        <PieChart h={300} data={UtilizationData} />
                    </Card>
                </Grid.Col>
            </Grid>

            <Divider my="lg" label="Performance & Efficiency Metrics" labelPosition="center" />

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card withBorder p="lg">
                        <Title order={5}>Profit Margin Over Time</Title>
                        <LineChart
                            h={250}
                            data={ProfitMarginData}
                            dataKey="month"
                            series={[{ name: "margin", color: "teal.6" }]}
                        />
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card withBorder p="lg">
                        <Title order={5}>Cost-to-Sales Ratio</Title>
                        <LineChart
                            h={250}
                            data={CostToSalesData}
                            dataKey="month"
                            series={[{ name: "ratio", color: "orange.6" }]}
                        />
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card withBorder p="lg">
                        <Title order={5}>Expense-to-Income Ratio</Title>
                        <LineChart
                            h={250}
                            data={ExpenseToIncomeData}
                            dataKey="month"
                            series={[{ name: "ratio", color: "purple.6" }]}
                        />
                    </Card>
                </Grid.Col>
            </Grid>

            <Divider my="lg" label="Comparative and Summary Views" labelPosition="center" />

            <Grid gutter="md">
                <Grid.Col span={12}>
                    <Card withBorder p="lg">
                        <Title order={4}>Monthly Summary Table</Title>
                        <div>{/* You can replace this with Mantine DataTable or SimpleGrid Table */}</div>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Year-on-Year Comparison</Title>
                        <BarChart
                            h={300}
                            data={YearlyComparisonData}
                            dataKey="month"
                            series={[
                                { name: "2024", color: "blue.6" },
                                { name: "2025", color: "cyan.6" },
                            ]}
                        />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="lg">
                        <Title order={4}>Best Performing Month</Title>
                        <BarChart
                            h={300}
                            data={BestMonthData}
                            dataKey="month"
                            series={[{ name: "profit", color: "green.8" }]}
                        />
                    </Card>
                </Grid.Col>
            </Grid>
        </div>
    );
}
