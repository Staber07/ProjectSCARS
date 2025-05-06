"use client";

import { Text, Flex } from "@mantine/core";
import { LineChart } from "@mantine/charts";

import { data } from './data';

export default function StatisticsPage() {
  console.debug("Rendering StatisticsPage");
  return (
    <div>
      <Flex
        mih={50}
        gap="xl"
        justify="center"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <Text mb="md" pl="md">
          Apples sales:
        </Text>

        <LineChart
          h={180}
          data={data}
          dataKey="date"
          series={[{ name: 'Apples', color: 'indigo.6' }]}
          lineChartProps={{ syncId: 'groceries' }}
        />

        <Text mb="md" pl="md" mt="xl">
          Tomatoes sales:
        </Text>

        <LineChart
          h={180}
          data={data}
          dataKey="date"
          lineChartProps={{ syncId: 'groceries' }}
          series={[{ name: 'Tomatoes', color: 'teal.6' }]}
        />


      </Flex>
    </div>
  );
}
