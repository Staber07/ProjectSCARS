"use client";

import { useRouter } from "next/navigation";

import {
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
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { Program } from "@/lib/info";
import { useAuth } from "@/lib/providers/auth";
import { CentralServerLogInUser } from "@/lib/api/auth";
import classes from "@/components/MainLoginComponent.module.css";

/**
 * The component for the main login page.
 */
export function MainLoginComponent(): React.ReactElement {
  const router = useRouter();
  const auth = useAuth();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { username: "", password: "", rememberMe: false },
  });

  /// Login function
  const loginUser = async (values: {
    username: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      auth.login(
        await CentralServerLogInUser(values.username, values.password),
      );
      notifications.show({
        title: "Login successful",
        message: "You are now logged in.",
      });
      router.push("/");
    } catch (error) {
      console.error("Error logging in:", error);
      notifications.show({
        title: "Login failed",
        message: `${error}`,
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        {Program.name}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {Program.description}
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(loginUser)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            key={form.key("username")}
            {...form.getInputProps("username")}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            key={form.key("password")}
            {...form.getInputProps("password")}
            required
            mt="md"
          />
          <Group justify="space-between" mt="lg">
            <Checkbox
              label="Remember me"
              {...form.getInputProps("rememberMe", { type: "checkbox" })}
            />
            {/* <Anchor component="button" size="sm"> */}
            {/*   Forgot password? */}
            {/* </Anchor> */}
          </Group>
          <Button type="submit" fullWidth mt="xl">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
