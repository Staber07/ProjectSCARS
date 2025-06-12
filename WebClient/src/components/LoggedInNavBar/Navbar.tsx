"use client";

import { Code, Group, Image, Indicator, NavLink, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconBuilding,
    IconDashboard,
    IconGraph,
    IconLogout,
    IconNotification,
    IconReport,
    IconSettings,
    IconUser,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

import { GetNotificationsQuantity } from "@/lib/api/notification";
import { Program } from "@/lib/info";
import { useAuth } from "@/lib/providers/auth";
import { useUser } from "@/lib/providers/user";
import { JSX, useEffect, useState } from "react";

import classes from "./Navbar.module.css";

export const Navbar: React.FC = () => {
    const [links, setLinks] = useState<JSX.Element[]>([]);
    const [notificationsQuantity, setNotificationsQuantity] = useState<number>(0);
    const userCtx = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    const fetchNotificationsQuantity = async () => {
        await GetNotificationsQuantity()
            .then((data) => {
                console.debug("Fetched notifications quantity:", data);
                setNotificationsQuantity(data);
            })
            .catch((error) => {
                console.error("Failed to fetch notifications quantity:", error);
                setNotificationsQuantity(0);
            });
    };

    useEffect(() => {
        const navbarContents = [
            {
                key: "dashboard",
                link: "/dashboard",
                label: "Dashboard",
                requiredPermission: null,
                disabledReason: null,
                icon: <IconDashboard stroke={1.5} />,
            },
            {
                key: "statistics",
                link: "/statistics",
                label: "School Statistics",
                requiredPermission: null,
                disabledReason: null,
                icon: <IconGraph stroke={1.5} />,
            },
            {
                key: "reports",
                link: "/reports",
                label: "School Reports",
                requiredPermission: null,
                disabledReason: null,
                icon: <IconReport stroke={1.5} />,
            },
            {
                key: "adminStatistics",
                link: "/administration/statistics",
                label: "Statistics Management",
                requiredPermission: null,
                disabledReason: null,
                icon: <IconGraph stroke={1.5} />,
            },
            {
                key: "adminReports",
                link: "/administration/reports",
                label: "Report Management",
                requiredPermission: null,
                disabledReason: null,
                icon: <IconReport stroke={1.5} />,
            },
            {
                key: "adminUsers",
                link: "/administration/users",
                label: "User Management",
                requiredPermission: "users:global:read",
                disabledReason: "You do not have permission to view the users list.",
                icon: <IconUser stroke={1.5} />,
            },
            {
                key: "adminSchools",
                link: "/administration/schools",
                label: "School Management",
                requiredPermission: "schools:global:read",
                disabledReason: "You do not have permission to view the schools list.",
                icon: <IconBuilding stroke={1.5} />,
            },
            {
                key: "adminSettings",
                link: "/administration/settings",
                label: "Site Management",
                requiredPermission: "site:manage",
                disabledReason: "You do not have permission to manage site settings.",
                icon: <IconSettings stroke={1.5} />,
            },
            {
                key: "notifications",
                link: "/account/notifications",
                label: "Notifications",
                requiredPermission: "notifications:self:view",
                disabledReason: "You do not have permission to view notifications.",
                icon: (
                    <Indicator disabled={notificationsQuantity === 0}>
                        <IconNotification stroke={1.5} />
                    </Indicator>
                ),
            },
            {
                key: "profile",
                link: "/account/profile",
                label: "Profile",
                requiredPermission: "users:self:read",
                disabledReason: "You do not have permission to view your profile.",
                icon: <IconUser stroke={1.5} />,
            },
        ];
        fetchNotificationsQuantity();
        setLinks(() => {
            return navbarContents
                .map((item) => {
                    const permissionGranted =
                        !item.requiredPermission || userCtx.userPermissions?.includes(item.requiredPermission);
                    console.debug("Checking permission for item", {
                        key: item.key,
                        requiredPermission: item.requiredPermission,
                        hasPermission: permissionGranted,
                    });
                    if (permissionGranted) {
                        return (
                            <NavLink
                                href={item.link}
                                key={item.key}
                                label={item.label}
                                leftSection={item.icon}
                                active={pathname.startsWith(item.link)}
                                disabled={!permissionGranted}
                                onClick={(event) => {
                                    if (!permissionGranted) {
                                        event.preventDefault();
                                        console.warn(`User does not have permission for ${item.label}`);
                                        return;
                                    }
                                }}
                            />
                        );
                    }
                })
                .filter((item): item is JSX.Element => item !== undefined);
        });
    }, [notificationsQuantity, pathname, router, userCtx.userPermissions]);

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
                <NavLink
                    href="#"
                    label="Logout"
                    leftSection={<IconLogout className={classes.linkIcon} stroke={1.5} />}
                    onClick={(event) => {
                        event.preventDefault();
                        logout();
                        console.info("User logged out");
                        notifications.show({
                            id: "logged-out",
                            title: "Logged Out",
                            message: "You are now logged out.",
                            icon: <IconLogout stroke={1.5} />,
                        });
                        router.push("/");
                    }}
                />
            </div>
        </nav>
    );
};
