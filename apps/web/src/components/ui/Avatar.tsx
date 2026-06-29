import type { ReactElement } from "react";

import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  initials: string;
  size?: AvatarSize;
  className?: string;
};

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/** Initials-based avatar in a brand-colored circle. */
export function Avatar({ initials, size = "md", className }: AvatarProps): ReactElement {
  const classes = [styles.avatar, SIZE_CLASS[size], className].filter(Boolean).join(" ");
  return (
    <span className={classes} aria-hidden>
      {initials}
    </span>
  );
}
