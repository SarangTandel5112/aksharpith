import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";

const BASE = "http://localhost:8000";

type FakeUser = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  storeId: string;
  terminalId: string;
  role: string;
};

function fakeUser(): FakeUser {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    organizationId: faker.string.uuid(),
    storeId: faker.string.uuid(),
    terminalId: `terminal-${faker.number.int({ min: 1, max: 10 })}`,
    role: faker.helpers.arrayElement(["cashier", "manager", "admin"]),
  };
}

// Shared user so GET /auth/me returns the same user as POST /auth/login
let currentUser = fakeUser();

export const authHandlers = [
  // POST /auth/login
  http.post(`${BASE}/auth/login`, () => {
    currentUser = fakeUser();
    return HttpResponse.json({
      accessToken: faker.string.alphanumeric(64),
      user: currentUser,
    });
  }),

  // POST /auth/logout
  http.post(`${BASE}/auth/logout`, () => {
    return HttpResponse.json({ ok: true });
  }),

  // GET /auth/me
  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json(currentUser);
  }),
];
