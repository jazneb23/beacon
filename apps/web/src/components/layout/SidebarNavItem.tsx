import Link from "next/link";
import type { ReactElement } from "react";

import type { NavItem } from "./navConfig";
import styles from "./Sidebar.module.css";

type SidebarNavItemProps = {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
};

/** A single sidebar navigation row with icon, label, and optional badge. */
export function SidebarNavItem({
  item,
  active,
  collapsed,
  onNavigate,
}: SidebarNavItemProps): ReactElement {
  const { icon: Icon, label, href, badge } = item;
  const className = [styles.navItem, active ? styles.navItemActive : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
    >
      <Icon className={styles.navIcon} size={20} aria-hidden />
      {!collapsed ? <span className={styles.navLabel}>{label}</span> : null}
      {!collapsed && badge ? (
        <span
          className={
            badge.type === "count" ? styles.badgeCount : styles.badgeSoon
          }
        >
          {badge.type === "count" ? badge.value : "Soon"}
        </span>
      ) : null}
    </Link>
  );
}
