import {
  IconBuildingStore,
  IconCategory,
  IconDashboard,
  IconPhoto,
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
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: IconDashboard }],
  },
  {
    title: "Catalog",
    items: [
      { label: "Departments", href: "/admin/departments", icon: IconBuildingStore },
      { label: "Categories", href: "/admin/categories", icon: IconCategory },
      { label: "Sub-categories", href: "/admin/sub-categories", icon: IconStack2 },
      { label: "Attributes", href: "/admin/attributes", icon: IconPalette },
      { label: "Group Templates", href: "/admin/groups", icon: IconTag },
    ],
  },
  {
    title: "Products",
    items: [
      { label: "Products", href: "/admin/products", icon: IconPackage },
      { label: "Product Media", href: "/admin/media", icon: IconPhoto },
      {
        label: "Marketing Media",
        href: "/admin/marketing-media",
        icon: IconTag,
      },
      { label: "Lot Matrix", href: "/admin/variants", icon: IconStack2 },
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
