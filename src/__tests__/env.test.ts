import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("dotenv", () => ({ config: vi.fn() }));
const originalEnv = process.env;

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("loads required environment variables", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "supersecretkeysuper";
    process.env.REFRESH_TOKEN_SECRET = "refreshsecretkey123";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";

    const { env } = await import("@/lib/env");

    expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(env.JWT_SECRET).toBe("supersecretkeysuper");
    expect(env.REFRESH_TOKEN_SECRET).toBe("refreshsecretkey123");
    expect(env.NEXT_PUBLIC_API_URL).toBe("http://localhost:3000");
  });

  it("throws when required environment variables are missing or invalid", async () => {
    process.env.DATABASE_URL = "";
    process.env.JWT_SECRET = "short";
    process.env.REFRESH_TOKEN_SECRET = "short";
    process.env.NEXT_PUBLIC_API_URL = "not-a-url";

    await expect(import("@/lib/env")).rejects.toThrow("Environment validation failed");
  });
});
