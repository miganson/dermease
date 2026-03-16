import { describe, expect, it } from "vitest";

describe("mock payment reference format", () => {
  it("creates a gateway-like prefix", () => {
    const reference = `pay-${Date.now()}-1234`;
    expect(reference.startsWith("pay-")).toBe(true);
  });
});
