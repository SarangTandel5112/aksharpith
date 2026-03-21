# 10 — Zod Schema Patterns

---

## Two Types of Schema — Different Folders

| Schema type | Folder | Purpose | Example |
|-------------|--------|---------|---------|
| Form schema | `features/<f>/validations/` | Validates user input in forms | `login-form.schema.ts` |
| API schema | `features/<f>/schemas/` | Validates API response shapes | `order-response.schema.ts` |

**Never mix them.** A form schema validates what the user typed.
An API schema validates what Django returned.

```
features/auth/
  validations/
    login-form.schema.ts      ← Zod schema for the login form fields
  schemas/
    auth-response.schema.ts   ← Zod schema for POST /auth/login response

features/checkout/
  validations/
    payment-form.schema.ts    ← Zod schema for payment form
  schemas/
    order-response.schema.ts  ← Zod schema for GET /orders/:id response
```

---

## Form Schema Pattern

```ts
// features/auth/validations/login-form.schema.ts
import { z } from 'zod'

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = z.infer<typeof LoginFormSchema>
```

Rules:
- Schema name: `PascalCase` + `Schema` suffix
- Inferred type name: same name without `Schema` + `Values` suffix
- Error messages: always human-readable, always in English
- Export both the schema AND the inferred type from the same file

---

## API Response Schema Pattern

```ts
// features/checkout/schemas/order-response.schema.ts
import { z } from 'zod'

const MoneySchema = z.object({
  amount:   z.number().int().nonnegative(),
  currency: z.string().length(3),
})

export const OrderResponseSchema = z.object({
  id:             z.string().uuid(),
  organizationId: z.string(),
  storeId:        z.string(),
  status:         z.enum(['draft', 'confirmed', 'paid', 'voided', 'refunded']),
  lines:          z.array(z.object({
    id:        z.string().uuid(),
    productId: z.string(),
    name:      z.string(),
    quantity:  z.number().int().positive(),
    unitPrice: MoneySchema,
    lineTotal: MoneySchema,
  })),
  total:     MoneySchema,
  createdAt: z.string().datetime(),
})

export type OrderResponse = z.infer<typeof OrderResponseSchema>
```

---

## Using Form Schemas with react-hook-form

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginFormSchema, type LoginFormValues } from '../validations/login-form.schema'

function LoginForm(props: LoginFormProps): React.JSX.Element {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form onSubmit={form.handleSubmit(props.onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      <input type="password" {...form.register('password')} />
      <button type="submit">Login</button>
    </form>
  )
}
```

---

## Using API Schemas to Validate Responses

Parse API responses at the infrastructure boundary — not in the feature layer.

```ts
// core/infrastructure/api/repositories/orders.repository.ts
import { OrderResponseSchema } from '@features/checkout/schemas/order-response.schema'

export async function fetchOrder(id: string, ctx: TenantContext) {
  const res  = await apiFetch(`/orders/${id}/`, { ctx })
  const json = await res.json()

  // Validate at the boundary — catch shape mismatches early
  const parsed = OrderResponseSchema.safeParse(json)
  if (!parsed.success) {
    console.error('[orders] unexpected response shape:', parsed.error)
    throw new Error('Order response did not match expected shape')
  }

  return parsed.data
}
```

---

## BFF Route Body Validation

BFF routes use `validateBody()` from `src/app/api/_lib/validate-request.ts`.
This is already implemented — use it on every POST/PUT/PATCH route.

```ts
// src/app/api/orders/route.ts
import { validateBody } from '@app/api/_lib/validate-request'
import { z } from 'zod'

const CreateOrderBodySchema = z.object({
  lines: z.array(z.object({
    productId: z.string(),
    quantity:  z.number().int().positive(),
  })).min(1, 'Order must have at least one line'),
})

export async function POST(req: Request): Promise<Response> {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })

  const validation = await validateBody(req, CreateOrderBodySchema)
  if (!validation.success) {
    return Response.json(
      { code: 'VALIDATION_ERROR', errors: validation.errors },
      { status: 422 },
    )
  }
  // validation.data is fully typed here
}
```

---

## Schema Testing

```ts
// features/auth/validations/login-form.schema.test.ts
import { LoginFormSchema } from './login-form.schema'

describe('LoginFormSchema', () => {
  it('rejects empty email', () => {
    const result = LoginFormSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
    }
  })

  it('rejects invalid email format', () => {
    const result = LoginFormSchema.safeParse({ email: 'notanemail', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    const result = LoginFormSchema.safeParse({ email: 'a@b.com', password: 'short' })
    expect(result.success).toBe(false)
  })

  it('accepts valid credentials', () => {
    const result = LoginFormSchema.safeParse({ email: 'cashier@store.com', password: 'password123' })
    expect(result.success).toBe(true)
  })
})
```
