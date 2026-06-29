import {
  BarChart2,
  Bell,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  Radio,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavBadge =
  | { type: "count"; value: number }
  | { type: "soon" };

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: NavBadge;
  /** Extra path prefixes that should mark this item active. */
  matchPaths?: string[];
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Primary product navigation, grouped Linear/Notion style. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Health Board", href: "/", icon: LayoutDashboard },
      {
        label: "Accounts",
        href: "/accounts",
        icon: Users,
        matchPaths: ["/accounts"],
      },
      { label: "Signals", href: "/signals", icon: Radio },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    items: [
      {
        label: "Playbooks",
        href: "/playbooks",
        icon: BookOpen,
        badge: { type: "soon" },
      },
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart2,
        badge: { type: "soon" },
      },
      {
        label: "Alerts",
        href: "/alerts",
        icon: Bell,
        badge: { type: "count", value: 3 },
      },
    ],
  },
];

/** Pinned footer navigation (settings + help). */
export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

/** All nav items flattened — used by the command palette navigation group. */
export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_SECTIONS.flatMap((section) => section.items),
  ...FOOTER_NAV_ITEMS,
];

/** Whether a nav item is active for the current pathname (prefix-aware). */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }
  if (pathname === item.href) {
    return true;
  }
  const prefixes = item.matchPaths ?? [item.href];
  return prefixes.some((prefix) => pathname.startsWith(`${prefix}/`));
}

/** Resolve the page title for a pathname from the nav config. */
export function getPageTitle(pathname: string): string {
  const match = ALL_NAV_ITEMS.find((item) => isNavItemActive(item, pathname));
  return match?.label ?? "Beacon";
}
