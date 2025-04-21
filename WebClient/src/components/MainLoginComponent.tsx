"use client";

import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "@/components/MainLoginComponent.module.css";
import { Program } from "@/lib/info";

export function MainLoginComponent() {
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        {Program.name}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {Program.description}
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Username" placeholder="Your username" required />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" />
          <Anchor component="button" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl">
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
