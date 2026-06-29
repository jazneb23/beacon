"use client";

import type { ReactElement } from "react";

import { useUser } from "../../contexts/UserContext";
import { PageHeader } from "../layout/PageHeader";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import styles from "./SettingsView.module.css";

/** Lightweight settings preview: profile, workspace, and appearance. */
export function SettingsView(): ReactElement {
  const user = useUser();

  return (
    <div>
      <PageHeader subtitle="Manage your profile and workspace." />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Profile</h2>
          <div className={styles.profile}>
            <Avatar initials={user.avatar} size="lg" />
            <div className={styles.profileText}>
              <span className={styles.name}>{user.name}</span>
              <span className={styles.muted}>{user.email}</span>
            </div>
          </div>
          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt className={styles.fieldLabel}>Role</dt>
              <dd className={styles.fieldValue}>{user.role}</dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.fieldLabel}>Plan</dt>
              <dd className={styles.fieldValue}>{user.plan}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Workspace</h2>
          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt className={styles.fieldLabel}>Name</dt>
              <dd className={styles.fieldValue}>Beacon</dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.fieldLabel}>Members</dt>
              <dd className={styles.fieldValue}>1</dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Appearance</h2>
          <div className={styles.appearanceRow}>
            <span className={styles.muted}>Theme</span>
            <ThemeToggle />
          </div>
        </section>
      </div>
    </div>
  );
}
