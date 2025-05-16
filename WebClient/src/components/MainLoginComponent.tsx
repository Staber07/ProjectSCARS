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
import { useDisclosure } from "@mantine/hooks";
import { IconLogin } from "@tabler/icons-react";
import { motion, useAnimation } from "motion/react";

import { Program } from "@/lib/info";
import { useAuth } from "@/lib/providers/auth";
import {
    CentralServerGetUserInfo,
    CentralServerLogInUser,
} from "@/lib/api/auth";

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
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const logoControls = useAnimation();

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
        buttonStateHandler.open()
        try {
            const tokens = await CentralServerLogInUser(
                values.username,
                values.password,
            );
            auth.login(tokens);
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
            buttonStateHandler.close();
        }
    };

    console.debug("Returning MainLoginComponent");
    return (
        <Container size={420} my={40} style={{ paddingTop: "150px" }}>
            <Title ta="center" className={classes.title}>
                <Flex
                    mih={50}
                    justify="center"
                    align="center"
                    direction="row"
                    wrap="wrap"
                >
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
                        onDragEnd={() => {
                            setTimeout(() => {
                                logoControls.start({ x: 0, y: 0 });
                            }, 2000);
                        }}
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
