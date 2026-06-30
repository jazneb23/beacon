import { describe, expect, it } from "vitest";

import { buildPoolConfig } from "./pool.js";

describe("buildPoolConfig", () => {
  it("disables strict SSL verification for Supabase URLs", () => {
    const config = buildPoolConfig(
      "postgresql://user:pass@db.abc123.supabase.com:5432/postgres",
    );

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
  });

  it("leaves SSL unset for local Docker database URLs", () => {
    const config = buildPoolConfig(
      "postgresql://beacon:beacon@localhost:5432/beacon",
    );

    expect(config.ssl).toBeUndefined();
  });
});
