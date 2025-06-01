"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { ProgramTitleCenter } from "@/components/ProgramTitleCenter";
import { ResetPassword } from "@/lib/api/auth";
import { Box, Button, Container, Paper, PasswordInput, Popover, Progress, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconArrowBackUp, IconCheck, IconSend, IconX } from "@tabler/icons-react";
import { motion, useAnimation } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import classes from "@/components/ResetPasswordComponent/ResetPasswordComponent.module.css";

interface ResetPasswordValues {
    new_password: string;
}

/**
 * A component that displays password requirements and checks if the password meets them.
 * @param {Object} props - The component props.
 * @param {boolean} props.meets - Whether the password meets the requirement.
 * @param {string} props.label - The label for the password requirement.
 * @returns {JSX.Element} The rendered component.
 */
function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text c={meets ? "teal" : "red"} style={{ display: "flex", alignItems: "center" }} mt={7} size="sm">
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /.{8,}/, label: "At least 8 characters" },
    { re: /[0-9]/, label: "Includes number" },
    { re: /[a-z]/, label: "Includes lowercase letter" },
    { re: /[A-Z]/, label: "Includes uppercase letter" },
];

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

/**
 * The actual component that uses useSearchParams
 */
function ResetPasswordContent(): React.ReactElement {
    const router = useRouter();
    const logoControls = useAnimation();
    const [requestSent, requestSentHandler] = useDisclosure(false);
    const [token, setToken] = useState<string | null>();
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const searchParams = useSearchParams();
    const [pwValue, setPwValue] = useState("");
    const [pwConfValue, setPwConfValue] = useState("");
    const [popoverOpened, setPopoverOpened] = useState(false);
    const form = useForm<ResetPasswordValues>({
        mode: "uncontrolled",
        initialValues: { new_password: "" },
    });
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(pwValue)} />
    ));
    const pwStrength = getStrength(pwValue);
    const meterColor = pwStrength === 100 ? "teal" : pwStrength > 50 ? "yellow" : "red";

    /**
     * Handles the password reset process.
     * @param {ResetPasswordValues} values - The values from the reset password form.
     * @return {Promise<void>} A promise that resolves when the password is reset.
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

        try {
            const response = await ResetPassword(token, values.new_password);
            if (response == null || response.message !== "Password reset successful.") {
                notifications.show({
                    title: "Password reset failed",
                    message: response.message,
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
                setTimeout(() => {
                    router.push("/login");
                }, 5000);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes("status code 400")) {
                notifications.show({
                    title: "Password reset failed",
                    message: error.message,
                    color: "red",
                    icon: <IconX />,
                });
            } else {
                console.error("Error resetting password:", error);
                notifications.show({
                    title: "Password reset failed",
                    message: `An error occurred while resetting your password: ${error}`,
                    color: "red",
                    icon: <IconX />,
                });
            }
            buttonStateHandler.close();
            return;
        }
    };

    useEffect(() => {
        setToken(searchParams?.get("token"));
    }, [searchParams]);

    console.debug("Returning ForgotPasswordComponent");
    return (
        <div>
            {/* Before the request is sent, show the form */}
            {!requestSent && (
                <Container size={420} my={40} style={{ paddingTop: "150px" }}>
                    <ProgramTitleCenter classes={classes} logoControls={logoControls} />
                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        <form onSubmit={form.onSubmit(resetPassword)}>
                            <Popover
                                opened={popoverOpened}
                                position="right"
                                width="target"
                                transitionProps={{ transition: "pop" }}
                            >
                                <Popover.Target>
                                    <div
                                        onFocusCapture={() => setPopoverOpened(true)}
                                        onBlurCapture={() => setPopoverOpened(false)}
                                    >
                                        <PasswordInput
                                            withAsterisk
                                            label="New Password"
                                            value={pwValue}
                                            placeholder="Your new password"
                                            key={form.key("new_password")}
                                            {...form.getInputProps("new_password")}
                                            mt="md"
                                            onChange={(event) => {
                                                setPwValue(event.currentTarget.value);
                                            }}
                                        />
                                        <PasswordInput
                                            withAsterisk
                                            label="Confirm Password"
                                            value={pwConfValue}
                                            placeholder="Confirm your new password"
                                            mt="md"
                                            onChange={(event) => {
                                                setPwConfValue(event.currentTarget.value);
                                            }}
                                        />
                                    </div>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <Text size="sm" mb={5} c="dimmed">
                                        Please choose a strong but memorable password.
                                    </Text>
                                    <Progress color={meterColor} value={pwStrength} size={5} mb="xs" />
                                    {checks}
                                </Popover.Dropdown>
                            </Popover>
                            <Container style={{ display: "flex", gap: "1rem" }}>
                                <Button
                                    id="reset-password-button"
                                    type="submit"
                                    fullWidth
                                    mt="xl"
                                    disabled={pwValue !== pwConfValue || pwStrength !== 100}
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
                                Enter your new password and click &quot;Reset Password&quot; to update your account
                                information.
                            </Text>
                        </form>
                    </Paper>
                </Container>
            )}
            {/* After the request is sent, show the confirmation message */}
            {requestSent && (
                <Container size={420} my={40} style={{ paddingTop: "150px" }}>
                    <ProgramTitleCenter classes={classes} logoControls={logoControls} />
                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        <Text size="lg" ta="center">
                            Password Reset!
                        </Text>
                        <Text size="sm" ta="center" mt={10}>
                            You have successfully reset your password. Please log in with your new account details.
                        </Text>
                        <Button
                            variant="light"
                            color="blue"
                            fullWidth
                            mt="xl"
                            leftSection={<IconArrowBackUp />}
                            onClick={() => {
                                router.push("/login");
                            }}
                            component={motion.button}
                            transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Back to Login
                        </Button>
                    </Paper>
                </Container>
            )}
        </div>
    );
}

/**
 * A component that allows users to reset their password.
 * @returns {React.ReactElement} The rendered component.
 */
export function ResetPasswordComponent(): React.ReactElement {
    return (
        <Suspense fallback={<LoadingComponent message="Please wait..." />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
