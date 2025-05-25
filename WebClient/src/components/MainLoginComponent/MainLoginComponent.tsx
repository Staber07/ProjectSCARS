"use client";

import { CentralServerGetUserInfo, CentralServerLogInUser } from "@/lib/api/auth";
import { Program } from "@/lib/info";
import { useAuth } from "@/lib/providers/auth";
import {
    Anchor,
    Button,
    Checkbox,
    Container,
    Flex,
    Group,
    Image,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconLogin, IconX } from "@tabler/icons-react";
import { motion, useAnimation } from "motion/react";
import { useRouter } from "next/navigation";

import classes from "@/components/MainLoginComponent/MainLoginComponent.module.css";

interface LoginFormValues {
    username: string;
    password: string;
    rememberMe: boolean;
}

/**
 * MainLoginComponent is the main login component for the application.
 * @returns {React.ReactElement} The rendered component.
 */
export function MainLoginComponent(): React.ReactElement {
    const router = useRouter();
    const auth = useAuth();
    const logoControls = useAnimation();
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const form = useForm<LoginFormValues>({
        mode: "uncontrolled",
        initialValues: { username: "", password: "", rememberMe: false },
    });

    /**
     * Handles the login process for the user.
     * @param {LoginFormValues} values - The values from the login form.
     * @return {Promise<void>} A promise that resolves when the login is complete.
     */
    const loginUser = async (values: LoginFormValues): Promise<void> => {
        console.debug("Logging in user", {
            username: values.username,
            rememberMe: values.rememberMe,
        });
        buttonStateHandler.open();
        // make sure the user has entered both username and password.
        if (!values.username || !values.password) {
            notifications.show({
                title: "Login failed",
                message: "Please enter both username and password.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        }

        try {
            const tokens = await CentralServerLogInUser(values.username, values.password);
            auth.login(tokens);
            await CentralServerGetUserInfo(true);
            console.info(`Login successful for user ${values.username}`);
            notifications.show({
                title: "Login successful",
                message: "You are now logged in.",
                color: "green",
                icon: <IconCheck />,
            });
            router.push("/");
        } catch (error) {
            if (error instanceof Error && error.message.includes("status code 401")) {
                notifications.show({
                    title: "Login failed",
                    message: "Please check your username and password.",
                    color: "red",
                    icon: <IconX />,
                });
            } else {
                console.error("Error logging in:", error);
                notifications.show({
                    title: "Login failed",
                    message: `${error}`,
                    color: "red",
                    icon: <IconX />,
                });
            }
            buttonStateHandler.close();
        }
    };

    console.debug("Returning MainLoginComponent");
    return (
        <Container size={420} my={40} style={{ paddingTop: "150px" }}>
            <Title ta="center" className={classes.title}>
                <Flex mih={50} justify="center" align="center" direction="row" wrap="wrap">
                    <Image
                        src="/assets/BENTOLogo.svg"
                        alt="BENTO Logo"
                        radius="md"
                        h={70}
                        w="auto"
                        fit="contain"
                        style={{ marginRight: "10px" }}
                        component={motion.img}
                        whileTap={{ scale: 0.95 }}
                        drag
                        dragElastic={{ top: 0.25, left: 0.25, right: 0, bottom: 0 }}
                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                        animate={logoControls}
                    />
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
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        mt="md"
                    />
                    <Group justify="space-between" mt="lg">
                        <Checkbox label="Remember me" {...form.getInputProps("rememberMe", { type: "checkbox" })} />
                        <Anchor
                            onClick={(e) => {
                                e.preventDefault();
                                router.push("/forgotPassword");
                            }}
                            component="button"
                            size="sm"
                        >
                            Forgot password?
                        </Anchor>
                    </Group>
                    <Button
                        id="login-button"
                        type="submit"
                        fullWidth
                        mt="xl"
                        loading={buttonLoading}
                        rightSection={<IconLogin />}
                        component={motion.button}
                        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        drag
                        dragElastic={0.1}
                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    >
                        Sign in
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}
