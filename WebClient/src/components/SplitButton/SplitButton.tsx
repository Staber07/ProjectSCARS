"use client";

import { ActionIcon, Button, Group, Menu, useMantineTheme } from "@mantine/core";
import { IconBookmark, IconChevronDown, IconEye } from "@tabler/icons-react";
import classes from "./SplitButton.module.css";

interface SplitButtonProps {
    onSubmit?: () => void;
    onSaveDraft?: () => void;
    onPreview?: () => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function SplitButton({
    onSubmit,
    onSaveDraft,
    onPreview,
    disabled = false,
    className = "",
    children = "Submit Report",
}: SplitButtonProps) {
    const theme = useMantineTheme();

    return (
        <Group wrap="nowrap" gap={0}>
            <Button className={`${classes.button} ${className}`} onClick={onSubmit} disabled={disabled}>
                {children}
            </Button>
            <Menu transitionProps={{ transition: "pop" }} position="bottom-end" withinPortal>
                <Menu.Target>
                    <ActionIcon
                        variant="filled"
                        color={theme.primaryColor}
                        size={36}
                        className={classes.menuControl}
                        disabled={disabled}
                    >
                        <IconChevronDown size={16} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<IconBookmark size={16} stroke={1.5} color={theme.colors.blue[5]} />}
                        onClick={onSaveDraft}
                    >
                        Save draft
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<IconEye size={16} stroke={1.5} color={theme.colors.blue[5]} />}
                        onClick={onPreview}
                    >
                        Preview
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}
