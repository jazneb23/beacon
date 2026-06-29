"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type PageTitleContextValue = {
  title: string | null;
  setTitle: (title: string | null) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

type PageTitleProviderProps = {
  children: ReactNode;
};

/** Lets pages override the header title (e.g. "Account Detail — Brightpath Health"). */
export function PageTitleProvider({ children }: PageTitleProviderProps): ReactElement {
  const [title, setTitle] = useState<string | null>(null);
  const value = useMemo(() => ({ title, setTitle }), [title]);

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

/** Read and update the current header title override. */
export function usePageTitle(): PageTitleContextValue {
  const context = useContext(PageTitleContext);

  if (context === null) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }

  return context;
}
