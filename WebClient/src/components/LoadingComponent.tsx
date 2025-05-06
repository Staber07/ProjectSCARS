import { Center, Loader, Paper, Stack, Text, Title } from "@mantine/core";

import { Program } from "@/lib/info";

import classes from "@/components/LoadingComponent.module.css";

type LoadingComponentProps = {
  message?: string;
};

/**
 * Show a loading screen
 */
export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = null,
}) => {
  console.debug("Returning LoadingComponent", { message });
  return (
    <Center>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack align="center" justify="center" gap="xs">
          <Title className={classes.title} data-testid="loading-title">
            {Program.name}
          </Title>
          {message && <Text data-testid="loading-message">{message}</Text>}
          <Loader color="blue" type="bars" />
        </Stack>
      </Paper>
    </Center>
  );
};
