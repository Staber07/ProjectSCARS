"use client";

import { useRouter, usePathname } from "next/navigation";
import {
    IconBuilding,
    IconDashboard,
    IconLogout,
    IconReport,
    IconSettings,
    IconUser,
    IconGraph,
} from "@tabler/icons-react";
import { Code, Group, Title, Image, NavLink, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import classes from "./Navbar.module.css";
import { useAuth } from "@/lib/providers/auth";
import { Program } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { JSX, useEffect, useState } from "react";

const navbarContents = [
    {
        key: "dashboard",
        link: "/dashboard",
        label: "Dashboard",
        requiredPermission: null,
        disabledReason: null,
        icon: IconDashboard,
    },
    {
        key: "statistics",
        link: "/statistics",
        label: "Statistics",
        requiredPermission: null,
        disabledReason: null,
        icon: IconGraph,
    },
    {
        key: "reports",
        link: "/reports",
        label: "Reports",
        requiredPermission: null,
        disabledReason: null,
        icon: IconReport,
    },
    {
        key: "profile",
        link: "/account/profile",
        label: "Profile",
        requiredPermission: null,
        disabledReason: null,
        icon: IconUser,
    },
    {
        key: "adminStatistics",
        link: "/administration/statistics",
        label: "Statistics",
        requiredPermission: null,
        disabledReason: null,
        icon: IconGraph,
    },
    {
        key: "adminReports",
        link: "/administration/reports",
        label: "Reports",
        requiredPermission: null,
        disabledReason: null,
        icon: IconReport,
    },
    {
        key: "adminUsers",
        link: "/administration/users",
        label: "Users",
        requiredPermission: "users:global:read",
        disabledReason: "You do not have permission to view the users list.",
        icon: IconUser,
    },
    {
        key: "adminSchools",
        link: "/administration/schools",
        label: "Schools",
        requiredPermission: null,
        disabledReason: null,
        icon: IconBuilding,
    },
    {
        key: "adminSettings",
        link: "/administration/settings",
        label: "Settings",
        requiredPermission: null,
        disabledReason: null,
        icon: IconSettings,
    },
];

export const Navbar: React.FC = () => {
    const [links, setLinks] = useState<JSX.Element[]>([]);
    const userCtx = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    useEffect(() => {
        setLinks(() => {
            return navbarContents.map((item) => {
                const permissionGranted =
                    !item.requiredPermission || userCtx.userPermissions?.includes(item.requiredPermission);
                console.debug("Checking permission for item", {
                    key: item.key,
                    requiredPermission: item.requiredPermission,
                    hasPermission: permissionGranted,
                });
                return (
                    <Tooltip
                        key={item.key}
                        label={item.disabledReason}
                        position="bottom"
                        disabled={permissionGranted}
                        withArrow
                    >
                        <span>
                            <NavLink
                                href={item.link}
                                label={item.label}
                                leftSection={<item.icon className={classes.linkIcon} stroke={1.5} />}
                                active={pathname === item.link}
                                disabled={!permissionGranted}
                                onClick={(event) => {
                                    if (!permissionGranted) {
                                        event.preventDefault();
                                        console.warn(`User does not have permission for ${item.label}`);
                                        return;
                                    }
                                }}
                            />
                        </span>
                    </Tooltip>
                );
            });
        });
    }, [pathname, router, userCtx.userPermissions]);

    console.debug("Returning Navbar");
    return (
        <nav className={classes.navbar}>
            <div className={classes.navbarMain}>
                <Group className={classes.header} data-onboarding-tour-id="onboarding-navbar-header">
                    <Image
                        src="/assets/BENTOLogo.svg"
                        alt="BENTO Logo"
                        radius="md"
                        h={70}
                        w="auto"
                        fit="contain"
                    ></Image>
                    <Title>{Program.name}</Title>
                    <Code fw={700}>{Program.version}</Code>
                </Group>
                {links}
            </div>
            <div className={classes.footer}>
                <a
                    href="#"
                    className={classes.link}
                    onClick={(event) => {
                        event.preventDefault();
                        logout();
                        console.info("User logged out");
                        notifications.show({
                            title: "Logged Out",
                            message: "You are now logged out.",
                        });
                        router.push("/");
                    }}
                >
                    <IconLogout className={classes.linkIcon} stroke={1.5} />
                    <span>Logout</span>
                </a>
            </div>
        </nav>
    );
};
