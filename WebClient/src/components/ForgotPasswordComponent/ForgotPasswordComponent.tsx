"use client";

import { Program } from "@/lib/info";
import { Button, Container, Flex, Image, Paper, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconArrowBackUp, IconMail, IconSend, IconX } from "@tabler/icons-react";
import { motion, useAnimation } from "motion/react";
import { useRouter } from "next/navigation";

import classes from "@/components/ForgotPasswordComponent/ForgotPasswordComponent.module.css";
import { CentralServerRequestPasswordRecovery } from "@/lib/api/auth";

interface ForgotPasswordValues {
    username: string;
    email: string;
}

/**
 * MainLoginComponent is the main login component for the application.
 * @returns {React.ReactElement} The rendered component.
 */
export function ForgotPasswordComponent(): React.ReactElement {
    const router = useRouter();
    const logoControls = useAnimation();
    const [requestSent, requestSentHandler] = useDisclosure(false);
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const form = useForm<ForgotPasswordValues>({
        mode: "uncontrolled",
        initialValues: { username: "", email: "" },
    });

    /**
     * Handles the login process for the user.
     * @param {ForgotPasswordValues} values - The values from the login form.
     * @return {Promise<void>} A promise that resolves when the login is complete.
     */
    const sendRecoveryLink = async (values: ForgotPasswordValues): Promise<void> => {
        console.debug("Logging in user", {
            username: values.username,
            email: values.email,
        });
        buttonStateHandler.open();

        // make sure the user has entered both username and password.
        if (!values.username || !values.email) {
            notifications.show({
                title: "Account recovery failed",
                message: "Please enter both username and password.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        }

        if (!values.email.includes("@")) {
            notifications.show({
                title: "Account recovery failed",
                message: "Please enter a valid email address.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        }

        await CentralServerRequestPasswordRecovery(values.email, values.username);
        requestSentHandler.open();
        notifications.show({
            title: "Account recovery email request sent",
            message: "If you entered the details correctly, an email will be sent. Please check your mail to proceed.",
            color: "green",
            icon: <IconMail />,
        });
        buttonStateHandler.close();
    };

    console.debug("Returning ForgotPasswordComponent");
    return (
        <div>
            {/* Before the request is sent, show the form */}
            {!requestSent && (
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
                        <form onSubmit={form.onSubmit(sendRecoveryLink)}>
                            <TextInput
                                label="Username"
                                placeholder="Your username"
                                key={form.key("username")}
                                {...form.getInputProps("username")}
                            />
                            <TextInput
                                label="Email"
                                placeholder="Your email"
                                key={form.key("email")}
                                {...form.getInputProps("email")}
                            />
                            <Container style={{ display: "flex", gap: "1rem" }}>
                                <Button
                                    id="login-button"
                                    type="submit"
                                    fullWidth
                                    mt="xl"
                                    loading={buttonLoading}
                                    rightSection={<IconSend />}
                                    component={motion.button}
                                    transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Send Recovery Link
                                </Button>
                            </Container>
                            <Text size="xs" mt="xs" c="dimmed" style={{ textAlign: "center" }}>
                                If you have forgotten your password, enter your username and email address to receive a
                                recovery link.
                            </Text>
                        </form>
                    </Paper>
                </Container>
            )}
            {/* After the request is sent, show the confirmation message */}
            {requestSent && (
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
                            />
                            {Program.name}
                        </Flex>
                    </Title>
                    <Text c="dimmed" size="sm" ta="center" mt={5}>
                        {Program.description}
                    </Text>
                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        <Text size="lg" ta="center">
                            Recovery link sent!
                        </Text>
                        <Text size="sm" ta="center" mt={10}>
                            Please check your email for the recovery link.
                        </Text>
                        <Button
                            variant="light"
                            color="blue"
                            fullWidth
                            mt="xl"
                            leftSection={<IconArrowBackUp />}
                            onClick={() => {
                                requestSentHandler.close();
                                router.push("/login");
                            }}
                        >
                            Back to Login
                        </Button>
                    </Paper>
                </Container>
            )}
        </div>
    );
}
