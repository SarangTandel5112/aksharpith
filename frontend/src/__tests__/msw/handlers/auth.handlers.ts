// src/__tests__/msw/handlers/auth.handlers.ts
import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

const BASE = 'http://localhost:3001'

type FakeRole = { id: string; roleName: string }
type FakeUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: FakeRole
}

function fakeRole(roleName = 'Viewer'): FakeRole {
  return { id: faker.string.uuid(), roleName }
}

function fakeUser(role?: FakeRole): FakeUser {
  return {
    id:        faker.string.uuid(),
    email:     faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    role:      role ?? fakeRole(),
  }
}

// Shared user so GET /api/users/me returns same user as POST /api/auth/login
let currentUser = fakeUser()

export const authHandlers = [
  // POST /api/auth/login → NestJS returns { message } + Set-Cookie header
  http.post(`${BASE}/api/auth/login`, () => {
    currentUser = fakeUser()
    return new HttpResponse(
      JSON.stringify({ statusCode: 200, message: 'Login successful', data: null }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie':   `access_token=fake-jwt-token; HttpOnly; SameSite=Strict`,
        },
      },
    )
  }),

  // POST /api/auth/logout
  http.post(`${BASE}/api/auth/logout`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'Logout successful', data: null })
  }),

  // GET /api/users/me → called by next-auth authorize() after login
  http.get(`${BASE}/api/users/me`, () => {
    return HttpResponse.json({
      statusCode: 200,
      message:    'OK',
      data:       currentUser,
    })
  }),
]
