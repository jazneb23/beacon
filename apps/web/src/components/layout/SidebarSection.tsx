import type { ReactElement } from "react";

import { isNavItemActive, type NavSection } from "./navConfig";
import { SidebarNavItem } from "./SidebarNavItem";
import styles from "./Sidebar.module.css";

type SidebarSectionProps = {
  section: NavSection;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
};

/** A labeled group of sidebar nav items (label hidden when collapsed). */
export function SidebarSection({
  section,
  pathname,
  collapsed,
  onNavigate,
}: SidebarSectionProps): ReactElement {
  return (
    <div className={styles.section}>
      {!collapsed ? (
        <p className={styles.sectionLabel}>{section.label}</p>
      ) : null}
      <nav className={styles.navList} aria-label={section.label}>
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            active={isNavItemActive(item, pathname)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}
