import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  $transaction: vi.fn(),
  candidate: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@/prisma/client", () => ({ prisma: prismaMock }));

describe("candidate service", () => {
  beforeEach(() => {
    vi.resetModules();
    prismaMock.$transaction.mockReset();
    prismaMock.candidate.count.mockReset();
    prismaMock.candidate.findMany.mockReset();
  });

  it("returns an empty candidate list when there are no candidates", async () => {
    prismaMock.$transaction.mockResolvedValue([0, []]);
    const { getCandidateList } = await import("@/services/candidate-service");

    const result = await getCandidateList({ page: 1, limit: 10 });

    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });
});
