import { Box, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export const requirements = [
    { re: /.{8,}/, label: "At least 8 characters" },
    { re: /[0-9]/, label: "Includes number" },
    { re: /[a-z]/, label: "Includes lowercase letter" },
    { re: /[A-Z]/, label: "Includes uppercase letter" },
];

export function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

/**
 * A component that displays password requirements and checks if the password meets them.
 * @param {Object} props - The component props.
 * @param {boolean} props.meets - Whether the password meets the requirement.
 * @param {string} props.label - The label for the password requirement.
 * @returns {JSX.Element} The rendered component.
 */
export function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text c={meets ? "teal" : "red"} style={{ display: "flex", alignItems: "center" }} mt={7} size="sm">
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}
