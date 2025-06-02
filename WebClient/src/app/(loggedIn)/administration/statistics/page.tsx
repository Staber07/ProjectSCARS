"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCoin,
  IconDiscount2,
  IconReceipt2,
  IconUserPlus,
} from '@tabler/icons-react';
import { Group, Paper, SimpleGrid, Text, Grid, Card, Title, Divider } from '@mantine/core';
import { LineChart, BarChart, AreaChart, PieChart } from '@mantine/charts';

import classes from './Stats.module.css';

import { getNetdata } from './NetSalesdata';
import { getGrossdata } from './GrossProfitdata';
import { getCostOfSalesData } from './CostofSalesData';
import { getExpensesBreakdownData } from './ExpensesBreakdownData';
import { getNetIncomeData } from './NetIncomeData';
import { getUtilizationData } from './UtilizationData';
import { getProfitMarginData } from './ProfitMarginData';
import { getCostToSalesData } from  './CostToSalesData';
import { getExpenseToIncomeData } from './ExpenseToIncomeData';
import { getMonthlySummaryData } from './MonthlySummaryData';
import { getYearlyComparisonData } from './YearlyComparisonData';
import { getBestMonthData } from './BestMonthData';

const Netdata = getNetdata();
const Grossdata = getGrossdata();
const CostOfSalesData = getCostOfSalesData();
const ExpenseBreakdownData = getExpensesBreakdownData();
const NetIncomeData = getNetIncomeData(); 
const UtilizationData = getUtilizationData();
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
  { title: 'Net Sales', icon: 'receipt', value: '13,456', diff: 34 },
  { title: 'Gross Profit', icon: 'coin', value: '4,145', diff: -13 },
  { title: 'Cost of Sales', icon: 'discount', value: '745', diff: 18 },
  { title: 'Net Income', icon: 'user', value: '188', diff: -30 },
] as const;

export default function StatisticsPage() {
  const stats = TopStats.map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed" className={classes.title}>{stat.title}</Text>
          <Icon className={classes.icon} size={22} stroke={1.5} />
        </Group>
        <Group align="flex-end" gap="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
            <span>{stat.diff}%</span>
            <DiffIcon size={16} stroke={1.5} />
          </Text>
        </Group>
        <Text fz="xs" c="dimmed" mt={7}>Compared to previous month</Text>
      </Paper>
    );
  });

  return (
    <div className={classes.root}>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>

      <Divider my="lg" label="Core Financial Statistics" labelPosition="center" />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Monthly Net Sales</Title>
          <LineChart h={300} data={Netdata} dataKey="date" series={[{ name: 'sales', color: 'indigo.6' }]} /></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Monthly Net Sales</Title>
          <LineChart h={300} data={Grossdata} dataKey="date" series={[{ name: 'sales', color: 'indigo.6' }]} /></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Cost of Sales + Gross Profit</Title>
          <BarChart h={300} data={CostOfSalesData} dataKey="month" series={[{ name: 'cost', color: 'red.6' }, { name: 'gross', color: 'green.6' }]} stacked /></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Expenses Breakdown</Title>
          <PieChart h={300} data={ExpenseBreakdownData} dataKey="category" valueKey="value" /></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Net Income from Operations</Title>
          <AreaChart h={300} data={NetIncomeData} dataKey="month" series={[{ name: 'net', color: 'blue.6' }]} /></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Utilization of Net Income</Title>
          <PieChart h={300} data={UtilizationData} dataKey="type" valueKey="amount" donut /></Card>
        </Grid.Col>
      </Grid>

      <Divider my="lg" label="Performance & Efficiency Metrics" labelPosition="center" />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg"><Title order={5}>Profit Margin Over Time</Title>
          <LineChart h={250} data={ProfitMarginData} dataKey="month" series={[{ name: 'margin', color: 'teal.6' }]} /></Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg"><Title order={5}>Cost-to-Sales Ratio</Title>
          <LineChart h={250} data={CostToSalesData} dataKey="month" series={[{ name: 'ratio', color: 'orange.6' }]} /></Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="lg"><Title order={5}>Expense-to-Income Ratio</Title>
          <LineChart h={250} data={ExpenseToIncomeData} dataKey="month" series={[{ name: 'ratio', color: 'purple.6' }]} /></Card>
        </Grid.Col>
      </Grid>

      <Divider my="lg" label="Comparative and Summary Views" labelPosition="center" />

      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder p="lg"><Title order={4}>Monthly Summary Table</Title><div>{/* You can replace this with Mantine DataTable or SimpleGrid Table */}</div></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Year-on-Year Comparison</Title>
          <BarChart h={300} data={YearlyComparisonData} dataKey="month" series={[{ name: '2024', color: 'blue.6' }, { name: '2025', color: 'cyan.6' }]} /></Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg"><Title order={4}>Best Performing Month</Title>
          <BarChart h={300} data={BestMonthData} dataKey="month" series={[{ name: 'profit', color: 'green.8' }]} /></Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
