import { useState } from 'react';
import {
  IconBuilding,
  IconDashboard,
  IconLogout,
  IconReport,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
  IconGraph
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
//import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './NavbarSimple.module.css';

const AdminNavbarContent = [
  { link: '/administration/statistics', label: 'Statistics', icon: IconGraph },
  { link: '/administration/reports', label: 'Reports', icon: IconReport },
  { link: '/administration/users', label: 'Users', icon: IconUser },
  { link: '/administration/schools', label: 'Schools', icon: IconBuilding },
  { link: '', label: 'Settings', icon: IconSettings }
];

const UserNavbarContent = [
  { link: '/Dashboard', label: 'Dashboard', icon: IconDashboard },
  { link: '', label: 'Statistics', icon: IconGraph },
  { link: '', label: 'Reports', icon: IconReport },
  { link: '', label: 'Profile', icon: IconUser },
]

export function Navbar() {
  const [active, setActive] = useState('Statistics');

  const links = AdminNavbarContent.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Code fw={700}>v3.1.2</Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}