// src/shared/lib/auth-options.test.ts
import { server } from "@test/msw/server";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { authOptions } from "./auth-options";

const BASE = "http://localhost:3001";

// Grab the CredentialsProvider from authOptions
// next-auth v4 CredentialsProvider stores the real authorize in provider.options
const credentialsProvider = (
  authOptions.providers[0] as {
    options: {
      authorize: (credentials: Record<string, string>) => Promise<unknown>;
    };
  }
).options;

describe("authOptions CredentialsProvider", () => {
  it("returns user object on valid login", async () => {
    server.use(
      http.post(
        `${BASE}/api/auth/login`,
        () =>
          new HttpResponse(
            JSON.stringify({
              statusCode: 200,
              message: "Login successful",
              data: null,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie":
                  "access_token=valid-jwt; HttpOnly; SameSite=Strict",
              },
            },
          ),
      ),
      http.get(`${BASE}/api/users/me`, () =>
        HttpResponse.json({
          statusCode: 200,
          message: "OK",
          data: {
            id: "user-1",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            role: { id: "role-1", roleName: "Admin" },
          },
        }),
      ),
    );

    const result = await credentialsProvider.authorize({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toMatchObject({
      id: "user-1",
      email: "test@example.com",
      firstName: "Test",
      role: { roleName: "Admin" },
      accessToken: "valid-jwt",
    });
  });

  it("returns null when NestJS returns 401", async () => {
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 }),
      ),
    );

    const result = await credentialsProvider.authorize({
      email: "bad@example.com",
      password: "wrong",
    });

    expect(result).toBeNull();
  });

  it("returns null when Set-Cookie header is missing", async () => {
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        HttpResponse.json(
          { statusCode: 200, message: "Login successful", data: null },
          { status: 200 },
        ),
      ),
    );

    const result = await credentialsProvider.authorize({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toBeNull();
  });
});
