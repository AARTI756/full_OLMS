import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: { findUnique: vi.fn() },
  department: { upsert: vi.fn() },
  offer: { create: vi.fn() },
  activity: { create: vi.fn() },
};

vi.mock("@/prisma/client", () => ({ prisma: prismaMock }));

describe("offer service", () => {
  beforeEach(() => {
    vi.resetModules();
    prismaMock.user.findUnique.mockReset();
    prismaMock.department.upsert.mockReset();
    prismaMock.offer.create.mockReset();
    prismaMock.activity.create.mockReset();
  });

  it("throws when the authenticated offer creator is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.department.upsert.mockResolvedValue({ id: "dep-1" });

    const { createOffer } = await import("@/services/offer-service");

    await expect(
      createOffer({
        candidateId: "cand-1",
        createdById: "missing-user",
        title: "Test Offer",
        department: "Engineering",
        designation: "Developer",
        status: "DRAFT",
        baseSalary: 50000,
        variablePay: 5000,
        joiningBonus: 2000,
        retentionBonus: 1000,
        probationPeriodMonths: 3,
        offerDate: "2026-01-01",
        validUntil: "2026-02-01",
      })
    ).rejects.toThrow("Authenticated offer creator not found.");
  });

  it("creates an offer only with a validated authenticated creator", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" });
    prismaMock.department.upsert.mockResolvedValue({ id: "dep-1" });
    prismaMock.offer.create.mockResolvedValue({ id: "offer-1", status: "DRAFT", candidateId: "cand-1" });

    const { createOffer } = await import("@/services/offer-service");

    const result = await createOffer({
      candidateId: "cand-1",
      createdById: "user-1",
      title: "Test Offer",
      department: "Engineering",
      designation: "Developer",
      status: "DRAFT",
      baseSalary: 50000,
      variablePay: 5000,
      joiningBonus: 2000,
      retentionBonus: 1000,
      probationPeriodMonths: 3,
      offerDate: "2026-01-01",
      validUntil: "2026-02-01",
    });

    expect(result).toMatchObject({ id: "offer-1" });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ select: { id: true }, where: { id: "user-1" } });
    expect(prismaMock.offer.create).toHaveBeenCalled();
  });
});
