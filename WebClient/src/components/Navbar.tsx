"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    IconBuilding,
    IconDashboard,
    IconLogout,
    IconReport,
    IconSettings,
    IconUser,
    IconGraph
} from "@tabler/icons-react";
import { Code, Group, Title, Image } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import classes from "./Navbar.module.css";
import { useAuth } from "@/lib/providers/auth";
import { Program } from "@/lib/info";

type NavbarProps = {
    enableAdminButtons?: boolean;
};

const navbarContents = {
    default: [
        {
            key: "dashboard",
            link: "/dashboard",
            label: "Dashboard",
            icon: IconDashboard,
        },
        {
            key: "statistics",
            link: "/statistics",
            label: "Statistics",
            icon: IconGraph,
        },
        { key: "reports", link: "/reports", label: "Reports", icon: IconReport },
        {
            key: "profile",
            link: "/account/profile",
            label: "Profile",
            icon: IconUser,
        },
    ],
    admin: [
        {
            key: "adminStatistics",
            link: "/administration/statistics",
            label: "Statistics",
            icon: IconGraph,
        },
        {
            key: "adminReports",
            link: "/administration/reports",
            label: "Reports",
            icon: IconReport,
        },
        {
            key: "adminUsers",
            link: "/administration/users",
            label: "Users",
            icon: IconUser,
        },
        {
            key: "adminSchools",
            link: "/administration/schools",
            label: "Schools",
            icon: IconBuilding,
        },
        {
            key: "adminSettings",
            link: "/administration/settings",
            label: "Settings",
            icon: IconSettings,
        },
    ],
};

export const Navbar: React.FC<NavbarProps> = ({
    enableAdminButtons = false,
}) => {
    const [active, setActive] = useState("dashboard");
    const router = useRouter();
    const { logout } = useAuth();

    const links = navbarContents.default.map((item) => (
        <a
            className={classes.link}
            data-active={item.key === active || undefined}
            data-onboarding-tour-id={`onboarding-navbar-${item.key}`}
            href={item.link}
            key={item.key}
            onClick={(event) => {
                console.debug("Clicked navbar link: ", item.label);
                event.preventDefault();
                setActive(item.key);
                router.push(item.link);
            }}
        >
            <item.icon className={classes.linkIcon} stroke={1.5} />
            <span>{item.label}</span>
        </a>
    ));
    const adminLinks = navbarContents.admin.map(
        (item) =>
            enableAdminButtons && (
                <a
                    className={classes.link}
                    data-active={item.key === active || undefined}
                    href={item.link}
                    key={item.key}
                    onClick={(event) => {
                        console.debug("Clicked navbar link: ", item.label);
                        event.preventDefault();
                        setActive(item.key);
                        router.push(item.link);
                    }}
                >
                    <item.icon className={classes.linkIcon} stroke={1.5} />
                    <span>{item.label}</span>
                </a>
            ),
    );

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
                    >
                    </Image>
                    <Title>{Program.name}</Title>
                    <Code fw={700}>{Program.version}</Code>
                </Group>
                {links}
                {adminLinks}
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
