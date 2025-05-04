import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuilding,
  IconDashboard,
  IconLogout,
  IconReport,
  IconSettings,
  IconUser,
  IconGraph,
} from "@tabler/icons-react";
import { Code, Group, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import classes from "./NavbarSimple.module.css";
import { CentralServerGetUserInfo } from "@/lib/api/auth";
import { useAuth } from "@/lib/providers/auth";
import { Program } from "@/lib/info";

const navbarContents = {
  default: [
    { link: "/dashboard", label: "Dashboard", icon: IconDashboard },
    { link: "/statistics", label: "Statistics", icon: IconGraph },
    { link: "/reports", label: "Reports", icon: IconReport },
    { link: "/account/profile", label: "Profile", icon: IconUser },
  ],
  admin: [
    {
      link: "/administration/statistics",
      label: "Statistics",
      icon: IconGraph,
    },
    { link: "/administration/reports", label: "Reports", icon: IconReport },
    { link: "/administration/users", label: "Users", icon: IconUser },
    { link: "/administration/schools", label: "Schools", icon: IconBuilding },
    { link: "/administration/settings", label: "Settings", icon: IconSettings },
  ],
};

export function Navbar() {
  const [active, setActive] = useState("Statistics");
  const router = useRouter();
  const { logout } = useAuth();

  const links = navbarContents.default.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        router.push(item.link);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userInfo = await CentralServerGetUserInfo();
        if (userInfo["roleId"] === 1) {
          links.push(
            ...navbarContents.admin.map((item) => (
              <a
                className={classes.link}
                data-active={item.label === active || undefined}
                href={item.link}
                key={item.label}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(item.label);
                  router.push(item.link);
                }}
              >
                <item.icon className={classes.linkIcon} stroke={1.5} />
                <span>{item.label}</span>
              </a>
            )),
          );
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      }
    };

    fetchUserRole();
  }, [active, links, router]);

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Title>{Program.name}</Title>
          <Code fw={700}>{Program.version}</Code>
        </Group>
        {links}
      </div>
      <div className={classes.footer}>
        {/* <a */}
        {/*   href="#" */}
        {/*   className={classes.link} */}
        {/*   onClick={(event) => event.preventDefault()} */}
        {/* > */}
        {/*   <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} /> */}
        {/*   <span>Change account</span> */}
        {/* </a> */}
        <a
          href="#"
          className={classes.link}
          onClick={(event) => {
            event.preventDefault();
            logout();
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
}
