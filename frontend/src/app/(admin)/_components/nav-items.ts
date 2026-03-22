import {
  IconBuildingStore,
  IconCategory,
  IconDashboard,
  IconPackage,
  IconSettings,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";
import type React from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: IconDashboard }],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Departments",
        href: "/admin/departments",
        icon: IconBuildingStore,
      },
      { label: "Products", href: "/admin/products", icon: IconPackage },
      { label: "Categories", href: "/admin/categories", icon: IconCategory },
    ],
  },
  {
    title: "Access",
    items: [
      { label: "Roles", href: "/admin/roles", icon: IconShield },
      { label: "Users", href: "/admin/users", icon: IconUsers },
      { label: "Settings", href: "/admin/settings", icon: IconSettings },
    ],
  },
];
