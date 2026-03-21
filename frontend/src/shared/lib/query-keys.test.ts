import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  it("is a const object", () => {
    expect(typeof queryKeys).toBe("object");
  });
});
