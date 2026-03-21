import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateBody } from "./validate-request";

const TestSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
});

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("validateBody", () => {
  it("returns data when body is valid", async () => {
    const req = makeRequest({ name: "Coffee", quantity: 2 });
    const result = await validateBody(req, TestSchema);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ name: "Coffee", quantity: 2 });
  });

  it("returns 422 with field errors when body is invalid", async () => {
    const req = makeRequest({ name: "", quantity: -1 });
    const result = await validateBody(req, TestSchema);

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    const body = await result.error?.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.errors).toHaveProperty("name");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const result = await validateBody(req, TestSchema);

    expect(result.data).toBeNull();
    const body = await result.error?.json();
    expect(body.code).toBe("INVALID_JSON");
  });
});
