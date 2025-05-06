"use client";

import { Text, MantineProvider, Container, createTheme, Flex } from "@mantine/core";
import { LineChart } from "@mantine/charts";

import { data } from './data';
import cx from 'clsx';
import classes from './container.module.css';

const theme = createTheme({
  components: {
    Container: Container.extend({
      classNames: (_, { size }) => ({
        root: cx({ [classes.responsiveContainer]: size === 'responsive' }),
      }),
    }),
  },
});

export default function StatisticsPage() {
  console.debug("Rendering StatisticsPage");
  return (

      <MantineProvider theme={theme}>
        <Container size="responsive" bg="var(--mantine-color-blue-light)">
          <LineChart
            h={500}
            data={data}
            dataKey="date"
            withLegend
            series={[
              { name: 'Apples', color: 'indigo.6' },
            ]}
          />
        </Container>
      </MantineProvider>
  );
}
