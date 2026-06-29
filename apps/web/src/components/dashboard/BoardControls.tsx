"use client";

import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { useEffect, useRef, useState, type ReactElement } from "react";

import {
  getSortLabel,
  type BoardFilter,
  type BoardSort,
  type BoardView,
} from "../../lib/boardFilters";
import styles from "./BoardControls.module.css";

const FILTERS: { id: BoardFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "at-risk", label: "At Risk" },
  { id: "warning", label: "Warning" },
  { id: "healthy", label: "Healthy" },
];

const SORTS: BoardSort[] = ["score", "name", "plan", "updated"];

type BoardControlsProps = {
  filter: BoardFilter;
  sort: BoardSort;
  view: BoardView;
  onFilterChange: (filter: BoardFilter) => void;
  onSortChange: (sort: BoardSort) => void;
  onViewChange: (view: BoardView) => void;
};

/** Filter pills, sort dropdown, and grid/list toggle for the board header. */
export function BoardControls({
  filter,
  sort,
  view,
  onFilterChange,
  onSortChange,
  onViewChange,
}: BoardControlsProps): ReactElement {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) {
      return;
    }
    const handlePointer = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [sortOpen]);

  return (
    <div className={styles.controls}>
      <div className={styles.pills} role="group" aria-label="Filter accounts">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? `${styles.pill} ${styles.pillActive}` : styles.pill}
            aria-pressed={filter === item.id}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.sort} ref={sortRef}>
        <button
          type="button"
          className={styles.sortButton}
          aria-haspopup="listbox"
          aria-expanded={sortOpen}
          onClick={() => setSortOpen((value) => !value)}
        >
          Sort by: {getSortLabel(sort)}
          {sort === "score" ? " ↓" : ""}
          <ChevronDown size={14} aria-hidden />
        </button>
        {sortOpen ? (
          <ul className={styles.sortMenu} role="listbox">
            {SORTS.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={sort === option}
                  className={
                    sort === option
                      ? `${styles.sortOption} ${styles.sortOptionActive}`
                      : styles.sortOption
                  }
                  onClick={() => {
                    onSortChange(option);
                    setSortOpen(false);
                  }}
                >
                  {getSortLabel(option)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.viewToggle} role="group" aria-label="View mode">
        <button
          type="button"
          className={view === "grid" ? `${styles.viewButton} ${styles.viewActive}` : styles.viewButton}
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          onClick={() => onViewChange("grid")}
        >
          <LayoutGrid size={16} aria-hidden />
        </button>
        <button
          type="button"
          className={view === "list" ? `${styles.viewButton} ${styles.viewActive}` : styles.viewButton}
          aria-label="List view"
          aria-pressed={view === "list"}
          onClick={() => onViewChange("list")}
        >
          <List size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
