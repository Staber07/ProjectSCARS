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
                requiredPermission: "users:self:read",
                showForRoles: [2, 3, 4, 5], // Superintendent, Administrator, Principal, Canteen Manager
                icon: <IconDashboard stroke={1.5} />,
            },
            {
                key: "statistics",
                link: "/statistics",
                label: "School Statistics",
                requiredPermission: "users:self:read",
                showForRoles: [2, 3, 4, 5],
                icon: <IconGraph stroke={1.5} />,
            },
            {
                key: "reports",
                link: "/reports",
                label: "School Reports",
                requiredPermission: "reports:local:read",
                showForRoles: [2, 3, 4, 5],
                icon: <IconReport stroke={1.5} />,
            },
            {
                key: "adminStatistics",
                link: "/administration/statistics",
                label: "Statistics Management",
                requiredPermission: "reports:global:read",
                showForRoles: [2, 3], // Superintendent, Administrator only
                icon: <IconGraph stroke={1.5} />,
            },
            {
                key: "adminReports",
                link: "/administration/reports",
                label: "Report Management",
                requiredPermission: "reports:global:read",
                showForRoles: [2, 3], // Superintendent, Administrator only
                icon: <IconReport stroke={1.5} />,
            },
            {
                key: "adminUsers",
                link: "/administration/users",
                label: "User Management",
                requiredPermission: "users:global:read",
                showForRoles: [1, 2, 3], // Website Admin, Superintendent, Administrator
                icon: <IconUser stroke={1.5} />,
            },
            {
                key: "adminSchools",
                link: "/administration/schools",
                label: "School Management",
                requiredPermission: "schools:global:read",
                showForRoles: [2, 3], // Superintendent, Administrator only
                icon: <IconBuilding stroke={1.5} />,
            },
            {
                key: "adminSettings",
                link: "/administration/settings",
                label: "Site Management",
                requiredPermission: "site:manage",
                showForRoles: [1], // Website Admin only
                icon: <IconSettings stroke={1.5} />,
            },
            {
                key: "notifications",
                link: "/account/notifications",
                label: "Notifications",
                requiredPermission: "notifications:self:view",
                showForRoles: [2, 3, 4, 5], // All except Website Admin
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
                showForRoles: [1, 2, 3, 4, 5], // All roles
                icon: <IconUser stroke={1.5} />,
            },
        ];

        fetchNotificationsQuantity();
        setLinks(() => {
            return navbarContents
                .map((item) => {
                    const permissionGranted =
                        userCtx.userPermissions?.includes(item.requiredPermission) &&
                        item.showForRoles.includes(Number(userCtx.userInfo?.roleId));

                    if (permissionGranted) {
                        return (
                            <NavLink
                                href={item.link}
                                key={item.key}
                                label={item.label}
                                leftSection={item.icon}
                                active={pathname.startsWith(item.link)}
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
    }, [notificationsQuantity, pathname, userCtx.userPermissions, userCtx.userInfo?.roleId]);

    console.debug("Returning Navbar");
    return (
        <nav className={classes.navbar}>
            <div className={classes.navbarMain}>
                <Group
                    className={classes.header}
                    justify="space-between"
                    data-onboarding-tour-id="onboarding-navbar-header"
                >
                    <Group>
                        <Image
                            src="/assets/logos/BENTO.svg"
                            alt="BENTO Logo"
                            radius="md"
                            h={70}
                            w="auto"
                            fit="contain"
                        />
                        <Title>{Program.name}</Title>
                        <Code fw={700}>{Program.version}</Code>
                    </Group>
                </Group>
                <div>{links}</div>
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
