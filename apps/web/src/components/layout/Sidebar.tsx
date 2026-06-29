"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

import { useUser } from "../../contexts/UserContext";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import {
  FOOTER_NAV_ITEMS,
  NAV_SECTIONS,
  isNavItemActive,
} from "./navConfig";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarSection } from "./SidebarSection";
import styles from "./Sidebar.module.css";

const APP_VERSION = "v0.1";

type SidebarProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

/** Persistent left navigation rail (Linear/Notion style). */
export function Sidebar({
  collapsed,
  onNavigate,
}: SidebarProps): ReactElement {
  const pathname = usePathname();
  const user = useUser();

  return (
    <aside
      className={collapsed ? `${styles.sidebar} ${styles.collapsed}` : styles.sidebar}
      aria-label="Primary navigation"
    >
      <div className={styles.brand}>
        <Link href="/" className={styles.brandLink} onClick={onNavigate}>
          <span className={styles.brandMark} aria-hidden>
            B
          </span>
          {!collapsed ? (
            <span className={styles.brandText}>
              Beacon
              <span className={styles.versionBadge}>{APP_VERSION}</span>
            </span>
          ) : null}
        </Link>
      </div>

      <div className={styles.scroll}>
        {NAV_SECTIONS.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <nav className={styles.navList} aria-label="Settings and help">
          {FOOTER_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              active={isNavItemActive(item, pathname)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className={styles.profileRow}>
          <div className={styles.profile}>
            <Avatar initials={user.avatar} size="md" />
            {!collapsed ? (
              <span className={styles.profileText}>
                <span className={styles.profileName}>{user.name}</span>
                <span className={styles.profileEmail}>{user.email}</span>
              </span>
            ) : null}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
