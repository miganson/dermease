import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats PHP values", () => {
    expect(formatCurrency(1234)).toContain("1,234");
  });
});
