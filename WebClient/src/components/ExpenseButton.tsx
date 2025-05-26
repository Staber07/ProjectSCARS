"use client";

import {
    IconBowl,
    IconCalendarEvent,
    IconChevronDown,
    IconCooker,
    IconHeartbeat,
    IconMoneybag,
    IconSettingsDollar,
    IconUsers,
} from '@tabler/icons-react';
import { Button, Menu, useMantineTheme } from '@mantine/core';
import { useRouter } from 'next/navigation';

interface ExpenseButtonMenuProps {
    label?: string;
    onSelect?: (path: string) => void;
}

export function ExpenseButtonMenu({ label = 'Create new', onSelect }: ExpenseButtonMenuProps) {
    const theme = useMantineTheme();
    const router = useRouter();

    const handleSelect = (path: string) => {
        if (onSelect) onSelect(path);
        router.push(path);
    };

    const menuItems = [
    {
        label: 'Operating Expenses',
        icon: IconSettingsDollar,
        color: theme.colors.blue[6],
        path: '/reports/liquidation-report', // '/reports/operating-expense'
    },
    {
        label: 'Administrative Expenses',
        icon: IconUsers,
        color: theme.colors.pink[6],
        path: '/reports/liquidation-report', // '/reports/administrative-expense'
    },
    {
        label: 'Supplementary Feeding Fund',
        icon: IconBowl,
        color: theme.colors.cyan[6],
        path: '/reports/liquidation-report', // '/reports/supplementary-feeding-fund'
    },
    {
        label: 'Clinic Fund',
        icon: IconHeartbeat,
        color: theme.colors.red[6],
        path: '/reports/liquidation-report', // '/reports/clinic-fund'
    },
    {
        label: 'Faculty and Student Development Fund',
        icon: IconCalendarEvent,
        color: theme.colors.grape[6],
        path: '/reports/liquidation-report', // '/reports/faculty-student-dev-fund'
    },
    {
        label: 'HE Fund',
        icon: IconCooker,
        color: theme.colors.yellow[6],
        path: '/reports/liquidation-report', // '/reports/he-fund'
    },
    {
        label: 'Revolving Fund',
        icon: IconMoneybag,
        color: theme.colors.green[6],
        path: '/reports/liquidation-report', // '/reports/revolving-fund'
    },
    ];

    return (
        <Menu
            transitionProps={{ transition: 'pop-top-right' }}
            position="top-end"
            width={260}
            withinPortal
            radius="md"
        >
            <Menu.Target>
                <Button rightSection={<IconChevronDown size={18} stroke={1.5} />} pr={12} radius="md">
                    {label}
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                {menuItems.map((item) => (
                    <Menu.Item
                        key={item.label}
                        onClick={() => handleSelect(item.path)}
                        leftSection={<item.icon size={16} color={item.color} stroke={1.5} />}
                    >
                        {item.label}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}
