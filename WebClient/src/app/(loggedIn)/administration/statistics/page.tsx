"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCoin,
  IconDiscount2,
  IconReceipt2,
  IconUserPlus,
} from '@tabler/icons-react';
import { Group, Paper, SimpleGrid, Text, Flex, Grid } from '@mantine/core';
import { LineChart } from '@mantine/charts';


import classes from './Stats.module.css';


import { Netdata } from './NetSalesdata';
import { Grossdata } from './GrossProfitdata';

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
  console.debug("Rendering StatisticsPage");

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
          <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
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

      <div style={{ marginTop: '10px' }}>

        <div style={{ resize: 'horizontal', overflow: 'hidden', maxWidth: '100%' }}>
          <Grid
            type="container"
            breakpoints={{ xs: '100px', sm: '200px', md: '300px', lg: '400px', xl: '500px' }}
          >

            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}><LineChart
              h={300}
              data={Netdata}
              dataKey="date"
              series={[{ name: 'sales', color: 'indigo.6' }]}
              curveType="monotone"
              connectNulls
            />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
              <LineChart
                h={300}
                data={Grossdata}
                dataKey="date"
                series={[{ name: 'gross', color: 'indigo.6' }]}
                curveType="bump"
                connectNulls
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
              3
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>

            </Grid.Col>
          </Grid>
        </div>



      </div>

    </div>

  );
}
