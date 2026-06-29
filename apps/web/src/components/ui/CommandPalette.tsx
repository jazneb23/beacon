"use client";

import {
  ArrowRight,
  Building2,
  Download,
  FileText,
  LayoutDashboard,
  Search,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";

import { ALL_NAV_ITEMS } from "../layout/navConfig";
import { fetchAccounts, type AccountWithLatestScore } from "../../lib/api";
import { toastInfo } from "../../lib/toast";
import styles from "./CommandPalette.module.css";

type CommandGroup = "Accounts" | "Actions" | "Navigation";

type Command = {
  id: string;
  label: string;
  icon: LucideIcon;
  group: CommandGroup;
  hint?: string;
  run: () => void;
};

type CommandPaletteProps = {
  onClose: () => void;
};

const GROUP_ORDER: CommandGroup[] = ["Accounts", "Actions", "Navigation"];

/** Linear-style global command palette (Cmd+K). Mounted only while open. */
export function CommandPalette({ onClose }: CommandPaletteProps): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState<AccountWithLatestScore[]>([]);
  const [rawActiveIndex, setRawActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load accounts and focus the input when the palette mounts.
  useEffect(() => {
    let cancelled = false;
    void fetchAccounts()
      .then((data) => {
        if (!cancelled) {
          setAccounts(data);
        }
      })
      .catch(() => undefined);
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      cancelled = true;
      window.clearTimeout(focusId);
    };
  }, []);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      close();
    },
    [router, close],
  );

  const commands = useMemo<Command[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const accountCommands: Command[] = accounts
      .filter((account) =>
        normalizedQuery ? account.name.toLowerCase().includes(normalizedQuery) : true,
      )
      .slice(0, 5)
      .map((account) => ({
        id: `account-${account.id}`,
        label: account.name,
        icon: Building2,
        group: "Accounts" as const,
        hint: "↵",
        run: () => navigate(`/accounts/${account.id}`),
      }));

    const actionCommands: Command[] = [
      {
        id: "action-board",
        label: "Go to Health Board",
        icon: LayoutDashboard,
        group: "Actions",
        run: () => navigate("/"),
      },
      {
        id: "action-at-risk",
        label: "View At-Risk Accounts",
        icon: ShieldAlert,
        group: "Actions",
        run: () => navigate("/accounts?filter=at-risk"),
      },
      {
        id: "action-digest",
        label: "Generate Digest",
        icon: FileText,
        group: "Actions",
        run: () => {
          toastInfo("Generating weekly digest...");
          close();
        },
      },
      {
        id: "action-export",
        label: "Export CSV",
        icon: Download,
        group: "Actions",
        run: () => {
          toastInfo("Preparing CSV export...");
          close();
        },
      },
    ];

    const navigationCommands: Command[] = ALL_NAV_ITEMS.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      icon: item.icon,
      group: "Navigation" as const,
      run: () => navigate(item.href),
    }));

    const all = [...accountCommands, ...actionCommands, ...navigationCommands];
    if (!normalizedQuery) {
      return all;
    }
    return all.filter((command) => command.label.toLowerCase().includes(normalizedQuery));
  }, [accounts, query, navigate, close]);

  // Clamp the highlighted index to the current result set (derived, no effect).
  const activeIndex = Math.min(rawActiveIndex, Math.max(0, commands.length - 1));

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setRawActiveIndex((index) => (index + 1) % Math.max(1, commands.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setRawActiveIndex(
        (index) => (index - 1 + commands.length) % Math.max(1, commands.length),
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commands[activeIndex]?.run();
    }
  };

  return (
    <div className={styles.overlay} onClick={close}>
      <div
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.searchRow}>
          <Search size={18} aria-hidden className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search accounts, signals, playbooks..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Command palette search"
          />
        </div>

        <div className={styles.results}>
          {commands.length === 0 ? (
            <p className={styles.empty}>No results for &ldquo;{query}&rdquo;</p>
          ) : (
            GROUP_ORDER.map((group) => {
              const groupCommands = commands.filter((command) => command.group === group);
              if (groupCommands.length === 0) {
                return null;
              }
              return (
                <div key={group} className={styles.group}>
                  <p className={styles.groupLabel}>{group}</p>
                  {groupCommands.map((command) => {
                    const index = commands.indexOf(command);
                    const Icon = command.icon;
                    const active = index === activeIndex;
                    return (
                      <button
                        key={command.id}
                        type="button"
                        className={active ? `${styles.item} ${styles.itemActive}` : styles.item}
                        onMouseEnter={() => setRawActiveIndex(index)}
                        onClick={command.run}
                      >
                        <Icon size={16} aria-hidden className={styles.itemIcon} />
                        <span className={styles.itemLabel}>{command.label}</span>
                        <kbd className={styles.itemHint}>
                          {command.hint ?? <ArrowRight size={12} aria-hidden />}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
