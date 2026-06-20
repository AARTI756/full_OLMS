import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: { findUnique: vi.fn() },
};

const authMock = {
  verifyAccessToken: vi.fn(),
};

describe("API auth middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/auth", () => authMock);
    vi.mock("@/prisma/client", () => ({ prisma: prismaMock }));
    prismaMock.user.findUnique.mockReset();
    authMock.verifyAccessToken.mockReset();
  });

  it("returns 401 when the authorization header is missing", async () => {
    const { requireApiAuth } = await import("@/lib/api-auth");
    const response = await requireApiAuth({ headers: new Headers() } as any, ["ADMIN"]);
    expect((response as Response).status).toBe(401);
  });

  it("returns 401 when the token is invalid", async () => {
    authMock.verifyAccessToken.mockImplementation(() => { throw new Error("Invalid token"); });
    const { requireApiAuth } = await import("@/lib/api-auth");
    const response = await requireApiAuth({ headers: new Headers({ authorization: "Bearer bad" }) } as any, ["ADMIN"]);
    expect((response as Response).status).toBe(401);
  });

  it("returns 403 when the user role is not allowed", async () => {
    authMock.verifyAccessToken.mockReturnValue({ sub: "user-1", email: "test@example.com", name: "Test", role: "RECRUITER" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1", name: "Test", email: "test@example.com", departmentId: null, role: { name: "RECRUITER" } });
    const { requireApiAuth } = await import("@/lib/api-auth");
    const response = await requireApiAuth({ headers: new Headers({ authorization: "Bearer valid" }) } as any, ["ADMIN"]);
    expect((response as Response).status).toBe(403);
  });
});
