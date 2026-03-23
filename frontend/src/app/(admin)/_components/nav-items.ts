import {
  IconBuildingStore,
  IconCategory,
  IconDashboard,
  IconPackage,
  IconPalette,
  IconSettings,
  IconShield,
  IconStack2,
  IconTag,
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
      { label: "Departments", href: "/admin/departments", icon: IconBuildingStore },
      { label: "Categories", href: "/admin/categories", icon: IconCategory },
      { label: "Sub-categories", href: "/admin/sub-categories", icon: IconStack2 },
      { label: "Attributes", href: "/admin/attributes", icon: IconPalette },
      { label: "Groups", href: "/admin/groups", icon: IconTag },
    ],
  },
  {
    title: "Products",
    items: [
      { label: "Products", href: "/admin/products", icon: IconPackage },
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
