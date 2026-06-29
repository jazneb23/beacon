/** The shape of the (mocked) signed-in user. */
export type CurrentUser = {
  name: string;
  email: string;
  role: string;
  avatar: string;
  plan: string;
};

/** Hardcoded current user — gives the app a "logged in" feel without real auth. */
export const CURRENT_USER: CurrentUser = {
  name: "Jeremy Benza",
  email: "jeremy@beacon.ai",
  role: "Admin",
  avatar: "JB",
  plan: "Pro",
};
