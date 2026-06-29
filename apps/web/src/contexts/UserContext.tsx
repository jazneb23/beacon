"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";

import { CURRENT_USER, type CurrentUser } from "../lib/user";

const UserContext = createContext<CurrentUser>(CURRENT_USER);

type UserProviderProps = {
  children: ReactNode;
  user?: CurrentUser;
};

/** Provides the mocked current user throughout the app. */
export function UserProvider({ children, user = CURRENT_USER }: UserProviderProps): ReactElement {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/** Access the current user from a UserProvider subtree. */
export function useUser(): CurrentUser {
  return useContext(UserContext);
}
