"use client";

import type { ReactElement } from "react";

import { FocusBoard } from "./FocusBoard";

/** Health Board: focused worklist of the accounts that need attention now. */
export function LiveHealthBoard(): ReactElement {
  return <FocusBoard />;
}
