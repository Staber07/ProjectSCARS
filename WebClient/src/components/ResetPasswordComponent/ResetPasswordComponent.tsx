"use client";

import { Program } from "@/lib/info";
import { Button, Container, Flex, Image, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconArrowBackUp, IconCheck, IconMail, IconSend, IconX } from "@tabler/icons-react";
import { motion, useAnimation } from "motion/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import classes from "@/components/ResetPasswordComponent/ResetPasswordComponent.module.css";
import { CentralServerResetPassword } from "@/lib/api/auth";
import { useEffect, useState } from "react";

interface ResetPasswordValues {
    new_password: string;
}

/**
 * MainLoginComponent is the main login component for the application.
 * @returns {React.ReactElement} The rendered component.
 */
export function ResetPasswordComponent(): React.ReactElement {
    const router = useRouter();
    const logoControls = useAnimation();
    const [requestSent, requestSentHandler] = useDisclosure(false);
    const [token, setToken] = useState<string | null>();
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const searchParams = useSearchParams();
    const form = useForm<ResetPasswordValues>({
        mode: "uncontrolled",
        initialValues: { new_password: "" },
    });

    /**
     * Handles the login process for the user.
     * @param {ResetPasswordValues} values - The values from the login form.
     * @return {Promise<void>} A promise that resolves when the login is complete.
     */
    const resetPassword = async (values: ResetPasswordValues): Promise<void> => {
        console.debug("Resetting password");
        buttonStateHandler.open();

        if (!values.new_password) {
            notifications.show({
                title: "Password reset failed",
                message: "Please enter a new password.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        }

        if (!token) {
            notifications.show({
                title: "Password reset failed",
                message: "No token provided. Please check the link you clicked.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        }

        const response = await CentralServerResetPassword(token, values.new_password);
        if (response.status !== 200) {
            notifications.show({
                title: "Password reset failed",
                message: "An error occurred while resetting your password. Please try again.",
                color: "red",
                icon: <IconX />,
            });
            buttonStateHandler.close();
            return;
        } else {
            requestSentHandler.open();
            notifications.show({
                title: "Password reset successfully",
                message: "Please log in with your new password.",
                color: "green",
                icon: <IconCheck />,
            });
            buttonStateHandler.close();
            requestSentHandler.close();
            setTimeout(() => {
                router.push("/login");
            }, 5000); // Delay to allow the notification to be shown
        }
    };

    useEffect(() => {
        setToken(searchParams.get("token"));
    }, []);

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
                        <form onSubmit={form.onSubmit(resetPassword)}>
                            <PasswordInput
                                label="New Password"
                                placeholder="Your new password"
                                key={form.key("new_password")}
                                {...form.getInputProps("new_password")}
                                mt="md"
                            />
                            <Container style={{ display: "flex", gap: "1rem" }}>
                                <Button
                                    id="reset-password-button"
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
                                    Reset Password
                                </Button>
                            </Container>
                            <Text size="xs" mt="xs" c="dimmed" style={{ textAlign: "center" }}>
                                Enter your new password.
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
                            You have successfully reset your password! Please log in with your new password.
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
