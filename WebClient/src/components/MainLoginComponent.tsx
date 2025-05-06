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
  Image,
  Flex
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { Program } from "@/lib/info";
import { useAuth } from "@/lib/providers/auth";
import {
  CentralServerGetUserInfo,
  CentralServerLogInUser,
} from "@/lib/api/auth";
import classes from "@/components/MainLoginComponent.module.css";
import BENTO from "./BENTOLogo.svg";

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
    console.debug("Logging in user", {
      username: values.username,
      rememberMe: values.rememberMe,
    });
    try {
      const tokens = await CentralServerLogInUser(
        values.username,
        values.password,
      );
      auth.login(tokens[0], tokens[1]);
      await CentralServerGetUserInfo(true);
      console.info(`Login successful for user ${values.username}`);
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

  console.debug("Returning MainLoginComponent");
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        <Flex
          mih={50}
          justify="center"
          align="center"
          direction="row"
          wrap="wrap"
        >
          <Image
            src={BENTO.src}
            alt="BENTO Logo"
            radius="md"
            h={70}
            w="auto"
            fit="contain"
            style={{ marginRight: "10px" }}
          >
          </Image>
          {Program.name}
        </Flex>
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
