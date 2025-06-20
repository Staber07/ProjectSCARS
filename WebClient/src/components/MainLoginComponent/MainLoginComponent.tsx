"use client";

import { ProgramTitleCenter } from "@/components/ProgramTitleCenter";
import { GetUserInfo, LoginUser } from "@/lib/api/auth";
import { useAuth } from "@/lib/providers/auth";
import { useUser } from "@/lib/providers/user";
import {
    Anchor,
    Button,
    Checkbox,
    Container,
    Divider,
    Group,
    Image,
    Paper,
    PasswordInput,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconLogin, IconX } from "@tabler/icons-react";
import { motion, useAnimation } from "motion/react";
import { useRouter } from "next/navigation";

import classes from "@/components/MainLoginComponent/MainLoginComponent.module.css";
import { GetUserAvatar } from "@/lib/api/user";

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
    const authCtx = useAuth();
    const userCtx = useUser();
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
                id: "login-error",
                title: "Login failed",
                message: "Please enter both username and password.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        }

        try {
            const tokens = await LoginUser(values.username, values.password);
            authCtx.login(tokens);

            const [userInfo, userPermissions] = await GetUserInfo();
            console.debug("User info fetched successfully", { id: userInfo.id, username: userInfo.username });
            let userAvatar: Blob | null = null;
            if (userInfo.avatarUrn) {
                userAvatar = await GetUserAvatar(userInfo.avatarUrn);
                if (userAvatar) {
                    console.debug("User avatar fetched successfully", { size: userAvatar.size });
                } else {
                    console.warn("No avatar found for user, using default avatar.");
                }
            }
            userCtx.updateUserInfo(userInfo, userPermissions, userAvatar);
            console.info(`Login successful for user ${values.username}`);
            notifications.show({
                id: "login-success",
                title: "Login successful",
                message: "You are now logged in.",
                color: "green",
                icon: <IconCheck />,
            });
            router.push("/dashboard");
        } catch (error) {
            if (error instanceof Error && error.message.includes("status code 401")) {
                notifications.show({
                    id: "login-failed",
                    title: "Login failed",
                    message: "Please check your username and password.",
                    color: "red",
                    icon: <IconX />,
                });
            } else if (error instanceof Error && error.message.includes("status code 429")) {
                notifications.show({
                    id: "login-too-many-attempts",
                    title: "Login failed",
                    message: "Too many attempts, please try again later.",
                    color: "red",
                    icon: <IconX />,
                });
            } else {
                console.error("Error logging in:", error);
                notifications.show({
                    id: "login-error",
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
            <ProgramTitleCenter classes={classes} logoControls={logoControls} />
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form
                    onSubmit={form.onSubmit(loginUser)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            // except when forgot password is focused
                            if (document.activeElement?.id === "forgot-password") {
                                document.getElementById("forgot-password")?.click();
                                return;
                            }
                            form.onSubmit(loginUser)();
                        }
                    }}
                >
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
                            id="forgot-password"
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
                    <Divider my="lg" label="Or continue with" labelPosition="center" />
                    <Group justify="center" mt="md">
                        <Button
                            variant="light"
                            onClick={async () => {
                                try {
                                    const response = await fetch("http://localhost:8081/v1/auth/oauth/google/login");
                                    const data = await response.json();
                                    if (data.url) {
                                        window.location.href = data.url;
                                    }
                                } catch (error) {
                                    console.error("Error starting OAuth:", error);
                                    notifications.show({
                                        title: "Login failed",
                                        message: "Failed to start Google login process.",
                                        color: "red",
                                        icon: <IconX />,
                                    });
                                }
                            }}
                        >
                            <Image
                                src="/assets/logos/google.svg"
                                alt="Log In with Google"
                                height={20}
                                width="auto"
                                radius="sm"
                                fit="contain"
                            />
                        </Button>
                        <Button variant="light">
                            <Image
                                src="/assets/logos/microsoft.svg"
                                alt="Log In with Microsoft"
                                height={20}
                                width="auto"
                                radius="sm"
                                fit="contain"
                            />
                        </Button>
                        {/* <Button variant="light">
                            <Image
                                src="/assets/logos/facebook.svg"
                                alt="Log In with Facebook"
                                height={20}
                                width="auto"
                                radius="sm"
                                fit="contain"
                            />
                        </Button> */}
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
