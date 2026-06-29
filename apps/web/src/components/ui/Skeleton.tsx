import type { CSSProperties, ReactElement } from "react";

import styles from "./Skeleton.module.css";

export type SkeletonProps = {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
};

/** Animated placeholder block shown while data loads. */
export function Skeleton({
  width = "100%",
  height = "1rem",
  radius = "var(--radius-sm)",
  className,
}: SkeletonProps): ReactElement {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return (
    <span
      aria-hidden
      className={className ? `${styles.skeleton} ${className}` : styles.skeleton}
      style={style}
    />
  );
}
