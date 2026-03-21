# API Reference — Aksharpith Backend

> **Base URL:** `http://localhost:3000/api` (development)
>
> **Authentication:** Cookie-based JWT. All protected endpoints require the `access_token` HttpOnly cookie set by `POST /api/auth/login`. Send requests with `credentials: 'include'` (fetch) or `withCredentials: true` (axios).

---

## Table of Contents

1. [Global Conventions](#global-conventions)
2. [Response Envelope](#response-envelope)
3. [Error Codes](#error-codes)
4. [Roles & Permissions](#roles--permissions)
5. [Authentication](#authentication)
6. [Roles](#roles)
7. [Users](#users)
8. [Departments](#departments)
9. [Categories](#categories)
10. [Sub-Categories](#sub-categories)
11. [Product Groups](#product-groups)
12. [Product Attributes](#product-attributes)
13. [Products](#products)
14. [Product Variants](#product-variants)
15. [Enums Reference](#enums-reference)
16. [Pagination Query Params](#pagination-query-params)
17. [Frontend Integration Guide](#frontend-integration-guide)

---

## Global Conventions

| Item | Value |
|------|-------|
| Global prefix | `/api` |
| Content-Type | `application/json` |
| Auth mechanism | HttpOnly cookie (`access_token`) |
| ID format | UUID v4 |
| Timestamps | ISO 8601 string (`2026-03-22T05:01:37.567Z`) |
| Soft-deleted records | Excluded from all list/get responses |
| `ValidationPipe` | `transform: true`, `whitelist: true` — unknown fields are stripped |

---

## Response Envelope

Every response (success or error) is wrapped in a standard envelope.

### Success with data
```json
{
  "statusCode": 10000,
  "message": "Success",
  "data": { ... }
}
```

### Success with paginated data
```json
{
  "statusCode": 10000,
  "message": "Success",
  "data": {
    "items": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Success — no body (204)
HTTP `204 No Content`. No response body.

### Error response
```json
{
  "statusCode": 10001,
  "message": "Human-readable error description",
  "url": "/api/the/path/that/failed"
}
```

> **Note:** `statusCode: 10000` = success, `statusCode: 10001` = error. These are **application-level** codes, not HTTP status codes. HTTP status codes are still standard (200, 201, 204, 400, 401, 403, 404, 409).

---

## Error Codes

| HTTP Status | Meaning | Common cause |
|-------------|---------|--------------|
| `400` | Bad Request / Validation failed | Missing required field, wrong type, invalid UUID |
| `401` | Unauthorized | No cookie, expired token, invalid credentials, inactive user |
| `403` | Forbidden | Authenticated but wrong role |
| `404` | Not Found | Resource with given ID does not exist |
| `409` | Conflict | Duplicate name / SKU violates unique constraint |
| `500` | Internal Server Error | Unexpected server failure |

---

## Roles & Permissions

Three built-in roles are seeded at startup:

| Role | Value | Access |
|------|-------|--------|
| Admin | `Admin` | Full read + write access |
| Staff | `Staff` | Read access + some write (group field values) |
| Viewer | `Viewer` | Read-only |

### Permission matrix

| Endpoint group | Admin | Staff | Viewer |
|----------------|-------|-------|--------|
| Auth (login/logout/register) | ✅ | ✅ | ✅ |
| Roles — read | ✅ | ❌ | ❌ |
| Roles — write | ✅ | ❌ | ❌ |
| Users — read | ✅ | ✅ | ❌ |
| Users — write | ✅ | ❌ | ❌ |
| Departments / Categories / Sub-categories — read | ✅ | ✅ | ✅ |
| Departments / Categories / Sub-categories — write | ✅ | ❌ | ❌ |
| Product Groups — read | ✅ | ✅ | ✅ |
| Product Groups — write | ✅ | ❌ | ❌ |
| Product Attributes — read | ✅ | ✅ | ✅ |
| Product Attributes — write | ✅ | ❌ | ❌ |
| Products — read | ✅ | ✅ | ✅ |
| Products — write | ✅ | ❌ | ❌ |
| Products — group field values write | ✅ | ✅ | ❌ |
| Products stats/count | ✅ | ✅ | ❌ |
| Product Variants — read | ✅ | ✅ | ✅ |
| Product Variants — write / generate matrix | ✅ | ❌ | ❌ |

---

## Authentication

**Base path:** `/api/auth`

No `Authorization` header is used. JWT is stored server-side in an HttpOnly cookie (`access_token`). Frontend must send requests with `credentials: 'include'`.

---

### `POST /api/auth/registration`

Register a new user. No authentication required.

**Request body:**
```json
{
  "firstName": "John",
  "middleName": "Paul",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "roleId": "43fd254c-e5af-449b-ba46-1043f072ef66"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | max 100 chars |
| `middleName` | string | ❌ | max 100 chars |
| `lastName` | string | ✅ | max 100 chars |
| `email` | string | ✅ | valid email, unique |
| `password` | string | ✅ | min 8 chars |
| `roleId` | string (UUID) | ❌ | must exist in `user_roles` |

**Response `200`:**
```json
{
  "statusCode": 10000,
  "message": "Success",
  "data": { "message": "User registered successfully" }
}
```

**Errors:** `400` validation, `409` email already exists.

---

### `POST /api/auth/login`

Authenticate a user. Sets the `access_token` HttpOnly cookie on success. JWT lifetime: **7 days**.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | ✅ | valid email |
| `password` | string | ✅ | 6–100 chars |

**Response `200`:**
```json
{
  "statusCode": 10000,
  "message": "Success",
  "data": { "message": "Login successful" }
}
```

Sets cookie:
```
Set-Cookie: access_token=<jwt>; Path=/; HttpOnly; SameSite=Strict
```
(In production: also `Secure`)

**Errors:** `400` validation, `401` wrong credentials or inactive account.

---

### `POST /api/auth/logout`

Clears the `access_token` cookie. No authentication required (safe to call even if already logged out).

**Response `200`:**
```json
{
  "statusCode": 10000,
  "message": "Success",
  "data": { "message": "Logout successful" }
}
```

---

## Roles

**Base path:** `/api/roles` · **Requires:** Admin only

---

### `GET /api/roles`

List all roles with pagination.

**Query params:** [Pagination](#pagination-query-params) + `search?: string`, `isActive?: boolean`

**Response `200`:**
```json
{
  "statusCode": 10000,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "43fd254c-e5af-449b-ba46-1043f072ef66",
        "roleName": "Admin",
        "isActive": true,
        "createdAt": "2026-03-22T04:39:45.832Z",
        "updatedAt": "2026-03-22T04:39:45.832Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### `GET /api/roles/:id`

Get a single role by UUID.

**Response `200`:** Single role object (same shape as items above).

**Errors:** `400` non-UUID, `404` not found.

---

### `POST /api/roles`

Create a role.

**Request body:**
```json
{ "roleName": "Manager" }
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `roleName` | string | ✅ | max 100 chars, unique |

**Response `201`:** Created role object.

**Errors:** `400` validation, `409` duplicate name.

---

### `PATCH /api/roles/:id`

Update a role.

**Request body:** `{ "roleName": "New Name" }` (all optional)

**Response `200`:** Updated role object.

**Errors:** `404` not found, `409` duplicate name.

---

### `DELETE /api/roles/:id`

Soft-delete a role. Returns `204 No Content`.

---

## Users

**Base path:** `/api/users`

---

### `GET /api/users`

**Requires:** Admin only

**Query params:** [Pagination](#pagination-query-params) + `search?: string`, `roleId?: UUID`, `isActive?: boolean`

**Response `200`:** Paginated list of users.

```json
{
  "data": {
    "items": [
      {
        "id": "b6b00629-2984-4f23-a92a-312f2cfd100a",
        "firstName": "Admin",
        "middleName": null,
        "lastName": "User",
        "email": "admin@test.com",
        "roleId": "43fd254c-e5af-449b-ba46-1043f072ef66",
        "role": {
          "id": "43fd254c-e5af-449b-ba46-1043f072ef66",
          "roleName": "Admin"
        },
        "isActive": true,
        "createdAt": "2026-03-22T04:40:13.000Z",
        "updatedAt": "2026-03-22T04:40:13.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### `GET /api/users/:id`

**Requires:** Admin or Staff

**Response `200`:** Single user object (shape same as above).

---

### `POST /api/users`

**Requires:** Admin only

**Request body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "securePass123",
  "roleId": "32b32b0c-0e3e-4253-97de-95e9dd1d8fdd",
  "isActive": true
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | max 100 chars |
| `middleName` | string | ❌ | max 100 chars |
| `lastName` | string | ✅ | max 100 chars |
| `email` | string | ✅ | valid email, unique |
| `password` | string | ✅ | min 8 chars |
| `roleId` | UUID | ✅ | must exist |
| `isActive` | boolean | ❌ | default `true` |

**Response `201`:** Created user (password field excluded from response).

---

### `PATCH /api/users/:id`

**Requires:** Admin only

All fields optional. Password cannot be changed via this endpoint.

---

### `DELETE /api/users/:id`

**Requires:** Admin only. Returns `204 No Content`.

---

## Departments

**Base path:** `/api/departments`

---

### `GET /api/departments`

**Requires:** Admin / Staff / Viewer

**Query params:** [Pagination](#pagination-query-params) + `search?: string`, `isActive?: boolean`

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "b493b5c9-a2c8-4c87-856a-1e9e7eaaf53c",
        "name": "Electronics",
        "isActive": true,
        "createdAt": "2026-03-22T04:42:04.680Z",
        "updatedAt": "2026-03-22T04:42:04.680Z"
      }
    ],
    "total": 1, "page": 1, "limit": 10, "totalPages": 1
  }
}
```

---

### `GET /api/departments/:id`

**Requires:** Admin / Staff / Viewer

---

### `POST /api/departments`

**Requires:** Admin only

```json
{ "name": "Electronics" }
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | max 150 chars, unique (case-sensitive) |

**Response `201`:** Created department.

**Errors:** `409` duplicate name.

---

### `PATCH /api/departments/:id`

**Requires:** Admin only. Fields: `name?: string`.

---

### `DELETE /api/departments/:id`

**Requires:** Admin only. Returns `204`.

---

## Categories

**Base path:** `/api/categories`

Identical structure to [Departments](#departments) — same CRUD pattern, same roles.

### `GET /api/categories`
### `GET /api/categories/:id`
### `POST /api/categories`

```json
{ "name": "Mobile Phones" }
```

### `PATCH /api/categories/:id`
### `DELETE /api/categories/:id`

> **Note:** Category names must be unique. `409` is returned on duplicates.

---

## Sub-Categories

**Base path:** `/api/sub-categories`

Sub-categories belong to a Category via `categoryId`. The combination of `(name, categoryId)` must be unique.

---

### `GET /api/sub-categories`

**Requires:** Admin / Staff / Viewer

**Query params:** [Pagination](#pagination-query-params) + `search?: string`, `categoryId?: UUID`, `isActive?: boolean`

**Response `200`:** Paginated list.

```json
{
  "data": {
    "items": [
      {
        "id": "a12e332a-7833-45f5-a428-bd9485004066",
        "name": "Android",
        "categoryId": "13b7d869-ee76-4d29-9bda-94872c930edd",
        "isActive": true,
        "createdAt": "2026-03-22T04:50:32.553Z",
        "updatedAt": "2026-03-22T04:50:32.553Z"
      }
    ],
    "total": 1, "page": 1, "limit": 10, "totalPages": 1
  }
}
```

---

### `GET /api/sub-categories/:id`

**Requires:** Admin / Staff / Viewer

---

### `POST /api/sub-categories`

**Requires:** Admin only

```json
{
  "name": "Android",
  "categoryId": "13b7d869-ee76-4d29-9bda-94872c930edd"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | max 150 chars |
| `categoryId` | UUID | ✅ | must exist in categories |

**Errors:** `400` invalid UUID, `404` category not found, `409` duplicate `(name, categoryId)`.

---

### `PATCH /api/sub-categories/:id`

**Requires:** Admin only. Fields: `name?: string`, `categoryId?: UUID`.

---

### `DELETE /api/sub-categories/:id`

**Requires:** Admin only. Returns `204`.

---

## Product Groups

**Base path:** `/api/product-groups`

Product groups define a dynamic schema of custom fields that can be attached to products. Each group has **fields**, and each dropdown-type field can have **options**.

---

### `GET /api/product-groups`

**Requires:** Admin / Staff / Viewer

**Query params:** [Pagination](#pagination-query-params) + `search?: string`, `isActive?: boolean`

**Response `200`:** Paginated list (fields not included — use `GET /:id/fields` for that).

```json
{
  "data": {
    "items": [
      {
        "id": "a1d9087e-3eff-4f03-ab39-ea4d8c4c3bce",
        "name": "Clothing",
        "isActive": true,
        "createdAt": "2026-03-22T04:56:29.911Z",
        "updatedAt": "2026-03-22T04:56:29.911Z"
      }
    ],
    "total": 1, "page": 1, "limit": 10, "totalPages": 1
  }
}
```

---

### `GET /api/product-groups/:id`

**Requires:** Admin / Staff / Viewer. Returns group without fields.

---

### `GET /api/product-groups/:id/fields`

**Requires:** Admin / Staff / Viewer. Returns group **with** all fields and their options.

```json
{
  "data": {
    "id": "a1d9087e-3eff-4f03-ab39-ea4d8c4c3bce",
    "name": "Clothing",
    "isActive": true,
    "fields": [
      {
        "id": "2b8dff98-a96a-4b77-bf7a-17888b9e9c34",
        "fieldName": "Size",
        "fieldType": "dropdown",
        "isRequired": true,
        "sortOrder": 1,
        "options": [
          { "id": "...", "optionLabel": "Small", "optionValue": "S", "sortOrder": 1 }
        ]
      },
      {
        "id": "82521f0f-e5cf-4d4e-aa30-75db2283f6db",
        "fieldName": "Color",
        "fieldType": "text",
        "isRequired": false,
        "sortOrder": 2,
        "options": []
      }
    ]
  }
}
```

---

### `POST /api/product-groups`

**Requires:** Admin only

Create a group and optionally its fields in one call.

```json
{
  "name": "Clothing",
  "fields": [
    {
      "fieldName": "Size",
      "fieldType": "dropdown",
      "isRequired": true,
      "sortOrder": 1,
      "options": [
        { "optionLabel": "Small", "optionValue": "S", "sortOrder": 1 },
        { "optionLabel": "Medium", "optionValue": "M", "sortOrder": 2 }
      ]
    },
    {
      "fieldName": "Color",
      "fieldType": "text",
      "isRequired": false,
      "sortOrder": 2
    }
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | max 150 chars, unique |
| `fields` | array | ❌ | see below |
| `fields[].fieldName` | string | ✅ | max 150 chars |
| `fields[].fieldType` | enum | ❌ | `text`, `textarea`, `number`, `boolean`, `dropdown` (default: `text`) |
| `fields[].isRequired` | boolean | ❌ | default `false` |
| `fields[].sortOrder` | number | ❌ | min 0 |
| `fields[].options` | array | ❌ | only meaningful for `dropdown` type |
| `fields[].options[].optionLabel` | string | ✅ | max 100 chars |
| `fields[].options[].optionValue` | string | ✅ | max 255 chars |
| `fields[].options[].sortOrder` | number | ❌ | min 0 |

> **fieldKey** is auto-generated from `fieldName` by slugifying (lowercased, non-alphanumeric → `_`). E.g., `"Shirt Size"` → `"shirt_size"`. It cannot be changed after creation.

**Response `201`:** Created group with fields.

**Errors:** `409` duplicate name.

---

### `PATCH /api/product-groups/:id`

**Requires:** Admin only

```json
{ "name": "Updated Name", "isActive": true }
```

**Errors:** `404`, `409` duplicate name.

---

### `DELETE /api/product-groups/:id`

**Requires:** Admin only. Returns `204`.

---

### `POST /api/product-groups/:id/fields`

**Requires:** Admin only. Add a field to an existing group.

```json
{
  "fieldName": "Material",
  "fieldType": "text",
  "isRequired": false,
  "isFilterable": true,
  "sortOrder": 3
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `fieldName` | string | ✅ | max 150 chars |
| `fieldKey` | string | ❌ | max 100 chars — auto-generated if omitted |
| `fieldType` | enum | ❌ | `text`, `textarea`, `number`, `boolean`, `dropdown` |
| `isRequired` | boolean | ❌ | |
| `isFilterable` | boolean | ❌ | marks field as filterable in product queries |
| `sortOrder` | number | ❌ | min 0 |

**Response `201`:** Created field object.

---

### `PATCH /api/product-groups/:id/fields/:fieldId`

**Requires:** Admin only. `fieldKey` and `fieldType` are **immutable** after creation.

Updatable fields: `fieldName`, `isRequired`, `isFilterable`, `sortOrder`.

---

### `DELETE /api/product-groups/:id/fields/:fieldId`

**Requires:** Admin only. Returns `204`. Will fail with `409` if field has existing values on products.

---

### `POST /api/product-groups/:id/fields/:fieldId/options`

**Requires:** Admin only. Add an option to a dropdown field.

```json
{
  "optionLabel": "Extra Large",
  "optionValue": "XL",
  "sortOrder": 4
}
```

**Response `201`:** Created option.

---

### `PATCH /api/product-groups/:id/fields/:fieldId/options/:optId`

**Requires:** Admin only. Fields: `optionLabel?`, `optionValue?`, `sortOrder?`.

---

### `DELETE /api/product-groups/:id/fields/:fieldId/options/:optId`

**Requires:** Admin only. Returns `204`. Will fail if option is in use.

---

## Product Attributes

**Base path:** `/api/product-attributes`

Attributes are used for generating product variants (Lot Matrix). E.g., `Color` with values `Red, Blue, Green` or `Size` with values `S, M, L`.

---

### `GET /api/product-attributes`

**Requires:** Admin / Staff / Viewer

**Query params:** [Pagination](#pagination-query-params) + `search?: string`, `isActive?: boolean`

**Response `200`:** Paginated list (values not included — use `GET /:id/values`).

```json
{
  "data": {
    "items": [
      {
        "id": "4360b2b9-e1c5-4245-9a84-79dbbe555a40",
        "name": "Color",
        "isActive": true,
        "createdAt": "2026-03-22T04:59:26.109Z",
        "updatedAt": "2026-03-22T04:59:26.109Z"
      }
    ],
    "total": 1, "page": 1, "limit": 10, "totalPages": 1
  }
}
```

---

### `GET /api/product-attributes/:id`

**Requires:** Admin / Staff / Viewer. Returns attribute without values.

---

### `GET /api/product-attributes/:id/values`

**Requires:** Admin / Staff / Viewer. Returns attribute **with** its values.

```json
{
  "data": {
    "id": "4360b2b9-e1c5-4245-9a84-79dbbe555a40",
    "name": "Color",
    "isActive": true,
    "values": [
      { "id": "b43f58e1-7d6f-4073-a66d-928fb1682cf6", "value": "Red", "sortOrder": 1, "isActive": true, "createdAt": "..." },
      { "id": "f712c916-4027-4980-994d-1a113cd2e21f", "value": "Blue", "sortOrder": 2, "isActive": true, "createdAt": "..." }
    ]
  }
}
```

---

### `POST /api/product-attributes`

**Requires:** Admin only. Create attribute and optionally its values in one call.

```json
{
  "name": "Color",
  "values": [
    { "value": "Red", "sortOrder": 1 },
    { "value": "Blue", "sortOrder": 2 },
    { "value": "Green", "sortOrder": 3 }
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | max 150 chars, unique |
| `values` | array | ❌ | |
| `values[].value` | string | ✅ | max 255 chars, unique per attribute |
| `values[].sortOrder` | number | ❌ | min 0 |
| `values[].isActive` | boolean | ❌ | default `true` |

**Response `201`:** Created attribute with values.

---

### `PATCH /api/product-attributes/:id`

**Requires:** Admin only. Fields: `name?`, `isActive?`.

---

### `DELETE /api/product-attributes/:id`

**Requires:** Admin only. Returns `204`.

---

### `POST /api/product-attributes/:id/values`

**Requires:** Admin only. Add a value to an existing attribute.

```json
{ "value": "White", "sortOrder": 4 }
```

**Response `201`:** Created value object.

---

### `PATCH /api/product-attributes/:id/values/:valueId`

**Requires:** Admin only. Fields: `value?`, `sortOrder?`, `isActive?`.

---

### `DELETE /api/product-attributes/:id/values/:valueId`

**Requires:** Admin only. Returns `204`.

---

## Products

**Base path:** `/api/products`

Products are the core entity. A product can have:
- **Media** (images/videos)
- **Marketing Media** (promotional content)
- **Physical Attributes** (weight, dimensions)
- **Zones** (geographic distribution zones)
- **Vendors** (supplier information)
- **Group Field Values** (dynamic custom fields from a Product Group)
- **Variants** (generated via Lot Matrix — see [Product Variants](#product-variants))

---

### `GET /api/products`

**Requires:** Admin / Staff / Viewer

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | default 1 |
| `limit` | number | default 10 |
| `sortBy` | string | field to sort by |
| `order` | `ASC` \| `DESC` | default ASC |
| `search` | string | searches name and SKU |
| `departmentId` | UUID | filter by department |
| `subCategoryId` | UUID | filter by sub-category |
| `groupId` | UUID | filter by product group |
| `productType` | enum | `simple`, `variable`, `digital`, `service` |
| `isActive` | boolean | |
| `itemInactive` | boolean | |
| `minPrice` | number | |
| `maxPrice` | number | |
| `minStock` | number | |
| `gf[fieldKey]` | string | filter by group field value, e.g. `gf[color]=Navy` or `gf[size]=$ilike:XL` |

**Response `200`:** Paginated list.

```json
{
  "data": {
    "items": [
      {
        "id": "47bf702f-93c2-4192-a593-7898ce7391f2",
        "name": "Test Shirt",
        "sku": "SHIRT-001",
        "description": null,
        "productType": "variable",
        "basePrice": "999.99",
        "stockQuantity": 0,
        "departmentId": "b493b5c9-...",
        "subCategoryId": "a12e332a-...",
        "groupId": "a1d9087e-...",
        "itemInactive": false,
        "isActive": true,
        "createdAt": "2026-03-22T04:59:12.280Z",
        "updatedAt": "2026-03-22T04:59:12.280Z"
      }
    ],
    "total": 1, "page": 1, "limit": 10, "totalPages": 1
  }
}
```

---

### `GET /api/products/stats/count`

**Requires:** Admin / Staff

Returns aggregate product count statistics.

---

### `GET /api/products/:id`

**Requires:** Admin / Staff / Viewer. Returns single product.

---

### `POST /api/products`

**Requires:** Admin only

```json
{
  "name": "Test Shirt",
  "sku": "SHIRT-001",
  "productType": "variable",
  "basePrice": 999.99,
  "description": "A comfortable cotton shirt",
  "stockQuantity": 0,
  "departmentId": "b493b5c9-a2c8-4c87-856a-1e9e7eaaf53c",
  "subCategoryId": "a12e332a-7833-45f5-a428-bd9485004066",
  "groupId": "a1d9087e-3eff-4f03-ab39-ea4d8c4c3bce"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | max 255 chars |
| `sku` | string | ✅ | max 100 chars, unique |
| `description` | string | ❌ | |
| `productType` | enum | ❌ | `simple`, `variable`, `digital`, `service` (default: `simple`) |
| `basePrice` | number | ❌ | min 0 (default: 0) |
| `stockQuantity` | number | ❌ | min 0 (default: 0) |
| `departmentId` | UUID | ❌ | must exist |
| `subCategoryId` | UUID | ❌ | must exist |
| `groupId` | UUID | ❌ | must exist — assigns dynamic field schema |
| `itemInactive` | boolean | ❌ | default `false` |
| `isActive` | boolean | ❌ | default `true` |

**Response `201`:** Created product.

**Errors:** `409` duplicate SKU.

---

### `PATCH /api/products/:id`

**Requires:** Admin only. All fields optional.

> **Important:** If changing `groupId`, pass `"clearFieldValues": true` to automatically delete existing group field values that would be orphaned.

```json
{
  "name": "Updated Shirt",
  "groupId": "new-group-uuid",
  "clearFieldValues": true
}
```

---

### `DELETE /api/products/:id`

**Requires:** Admin only. Returns `204`.

---

### Product Media

#### `GET /api/products/:id/media`
**Requires:** Admin / Staff / Viewer

```json
{
  "data": [
    {
      "id": "47550414-de48-4c72-9229-f280fb804452",
      "productId": "47bf702f-...",
      "url": "https://example.com/shirt.jpg",
      "mediaType": "image",
      "sortOrder": 0,
      "isPrimary": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### `POST /api/products/:id/media`
**Requires:** Admin only

```json
{
  "url": "https://example.com/shirt.jpg",
  "mediaType": "image",
  "sortOrder": 0,
  "isPrimary": true
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `url` | string | ✅ | valid URL |
| `mediaType` | enum | ❌ | `image`, `video` (default: `image`) |
| `sortOrder` | number | ❌ | min 0 |
| `isPrimary` | boolean | ❌ | default `false` |

#### `DELETE /api/products/:id/media/:mediaId`
**Requires:** Admin only. Returns `204`.

---

### Physical Attributes

#### `GET /api/products/:id/physical-attributes`
**Requires:** Admin / Staff / Viewer

#### `PUT /api/products/:id/physical-attributes`
**Requires:** Admin only. **Upserts** (creates or replaces).

```json
{
  "weight": 0.5,
  "length": 30.0,
  "width": 20.0,
  "height": 2.0
}
```

All fields optional. Values in kg/cm. Returns upserted record.

---

### Marketing Media

#### `GET /api/products/:id/marketing-media`
**Requires:** Admin / Staff / Viewer

#### `POST /api/products/:id/marketing-media`
**Requires:** Admin only

```json
{
  "mediaUrl": "https://example.com/promo.mp4",
  "mediaType": "video",
  "displayOrder": 1,
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "duration": 30,
  "fileSize": 1024000
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `mediaUrl` | string | ✅ | valid URL |
| `mediaType` | enum | ❌ | `photo`, `video` (default: `photo`) |
| `displayOrder` | number | ❌ | min 0 |
| `thumbnailUrl` | string | ❌ | valid URL |
| `duration` | number | ❌ | seconds, min 0 |
| `fileSize` | number | ❌ | bytes, min 0 |

#### `DELETE /api/products/:id/marketing-media/:mediaId`
**Requires:** Admin only. Returns `204`.

---

### Zones

#### `GET /api/products/:id/zones`
**Requires:** Admin / Staff / Viewer

#### `POST /api/products/:id/zones`
**Requires:** Admin only

```json
{
  "zoneName": "North Zone",
  "zoneCode": "NZ1",
  "description": "Northern distribution zone",
  "isActive": true
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `zoneName` | string | ✅ | max 100 chars |
| `zoneCode` | string | ❌ | max 10 chars, unique per product |
| `description` | string | ❌ | |
| `isActive` | boolean | ❌ | default `true` |

#### `PATCH /api/products/:id/zones/:zoneId`
**Requires:** Admin only. Same fields, all optional.

#### `DELETE /api/products/:id/zones/:zoneId`
**Requires:** Admin only. Returns `204`.

---

### Vendors

#### `GET /api/products/:id/vendors`
**Requires:** Admin / Staff / Viewer

#### `POST /api/products/:id/vendors`
**Requires:** Admin only

```json
{
  "vendorName": "Textile Co",
  "contactPerson": "John Smith",
  "contactEmail": "john@textile.com",
  "contactPhone": "+1234567890",
  "gstin": "22AAAAA0000A1Z5",
  "address": "123 Factory Lane",
  "isPrimary": true,
  "notes": "Preferred supplier",
  "isActive": true
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `vendorName` | string | ✅ | max 150 chars |
| `contactPerson` | string | ❌ | max 100 chars |
| `contactEmail` | string | ❌ | valid email |
| `contactPhone` | string | ❌ | max 20 chars |
| `gstin` | string | ❌ | max 15 chars (Indian GST number) |
| `address` | string | ❌ | |
| `isPrimary` | boolean | ❌ | default `false` |
| `notes` | string | ❌ | |
| `isActive` | boolean | ❌ | default `true` |

#### `PATCH /api/products/:id/vendors/:vendorId`
**Requires:** Admin only. Same fields, all optional.

#### `DELETE /api/products/:id/vendors/:vendorId`
**Requires:** Admin only. Returns `204`.

---

### Group Field Values

Custom dynamic field values for the product, defined by the product's assigned `groupId`.

#### `GET /api/products/:id/group-field-values`
**Requires:** Admin / Staff / Viewer

```json
{
  "data": [
    {
      "id": "...",
      "productId": "47bf702f-...",
      "fieldId": "2b8dff98-...",
      "valueText": "XL",
      "valueNumber": null,
      "valueBoolean": null,
      "valueOptionId": null
    }
  ]
}
```

#### `PUT /api/products/:id/group-field-values`
**Requires:** Admin or Staff. **Upserts** — creates new or replaces existing values for each `fieldId`.

```json
{
  "values": [
    { "fieldId": "2b8dff98-a96a-4b77-bf7a-17888b9e9c34", "valueText": "XL" },
    { "fieldId": "82521f0f-e5cf-4d4e-aa30-75db2283f6db", "valueText": "Navy" },
    { "fieldId": "some-number-field-id", "valueNumber": 42.5 },
    { "fieldId": "some-bool-field-id", "valueBoolean": true },
    { "fieldId": "some-dropdown-field-id", "valueOptionId": "option-uuid" }
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `values` | array | ✅ | min 1 item |
| `values[].fieldId` | UUID | ✅ | must belong to product's group |
| `values[].valueText` | string \| null | ❌ | for `text` / `textarea` field types |
| `values[].valueNumber` | number \| null | ❌ | for `number` field type |
| `values[].valueBoolean` | boolean \| null | ❌ | for `boolean` field type |
| `values[].valueOptionId` | UUID \| null | ❌ | for `dropdown` field type |

> **Validation:** All `fieldId` values must belong to the product's current `groupId`. If any are invalid, the entire request fails with `400`.

#### `DELETE /api/products/:id/group-field-values/:fieldId`
**Requires:** Admin only. Returns `204`.

---

## Product Variants

**Base path:** `/api/products/:productId/variants`

Variants represent specific combinations of attribute values (e.g., "Red + Size M"). They are generated using the **Lot Matrix** which auto-creates all combinations from selected attributes.

---

### `GET /api/products/:productId/variants`

**Requires:** Admin / Staff / Viewer

**Query params:** [Pagination](#pagination-query-params) + `isActive?: boolean`, `isDeleted?: boolean`

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "5399fddf-ddf6-4f82-8f67-19cee909e7d2",
        "productId": "47bf702f-...",
        "sku": "47bf702f-d7b7b307-a2a",
        "price": 0,
        "stockQuantity": 0,
        "combinationHash": "d7b7b307-..._f712c916-...",
        "isDeleted": false,
        "isActive": true,
        "createdAt": "...",
        "updatedAt": "...",
        "variantAttributes": [
          {
            "variantId": "5399fddf-...",
            "attributeId": "4360b2b9-...",
            "attributeValueId": "f712c916-..."
          },
          {
            "variantId": "5399fddf-...",
            "attributeId": "2be71fd6-...",
            "attributeValueId": "d7b7b307-..."
          }
        ]
      }
    ],
    "total": 9, "page": 1, "limit": 10, "totalPages": 1
  }
}
```

---

### `GET /api/products/:productId/variants/:id`

**Requires:** Admin / Staff / Viewer. Returns single variant.

---

### `POST /api/products/:productId/variants/generate-matrix`

**Requires:** Admin only

**The Lot Matrix** — generates all combinations of attribute values for the given attribute IDs. Previously-existing combinations are **skipped** (not duplicated). Soft-deleted combinations matching a new combo are **restored**.

```json
{
  "attributeIds": [
    "4360b2b9-e1c5-4245-9a84-79dbbe555a40",
    "2be71fd6-07e8-4c6b-b0cc-a0dc35239b15"
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `attributeIds` | UUID[] | ✅ | min 1 item — IDs of `ProductAttribute` records (not values, the parent attribute) |

> **How it works:** For `Color` (Red, Blue, Green) × `Size` (S, M, L) → generates 9 variants. Each variant gets an auto-generated SKU and a `combinationHash` for deduplication.

**Response `200`:** Array of all newly created (or restored) variant objects.

---

### `POST /api/products/:productId/variants`

**Requires:** Admin only. Create a single variant manually.

```json
{
  "sku": "SHIRT-RED-M",
  "price": 1299.00,
  "stockQuantity": 50,
  "attributeValueIds": [
    "f712c916-4027-4980-994d-1a113cd2e21f",
    "14de30c8-6a74-4ff6-8e72-7fafe92c65b9"
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `sku` | string | ✅ | unique per product |
| `price` | number | ✅ | min 0 |
| `stockQuantity` | number | ❌ | min 0 |
| `attributeValueIds` | UUID[] | ✅ | min 1 — IDs of `ProductAttributeValue` records |

**Errors:** `409` duplicate combination already exists.

---

### `PATCH /api/products/:productId/variants/:id`

**Requires:** Admin only. Update price/stock/status.

```json
{
  "price": 1499.00,
  "stockQuantity": 25,
  "isActive": true,
  "isDeleted": false
}
```

All fields optional.

---

### `DELETE /api/products/:productId/variants/:id`

**Requires:** Admin only. Returns `204`.

---

## Enums Reference

### `ProductType`
| Value | Description |
|-------|-------------|
| `simple` | Single product with no variants |
| `variable` | Product with attribute-based variants |
| `digital` | Downloadable/digital product |
| `service` | Service product |

### `FieldType` (Group Fields)
| Value | Use case |
|-------|----------|
| `text` | Short text input |
| `textarea` | Multi-line text |
| `number` | Numeric value |
| `boolean` | True/false toggle |
| `dropdown` | Select from predefined options |

### `MediaType` (Product Media)
| Value |
|-------|
| `image` |
| `video` |

### `MarketingMediaType`
| Value |
|-------|
| `photo` |
| `video` |

---

## Pagination Query Params

All list endpoints accept these standard query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (min: 1) |
| `limit` | number | `10` | Items per page (min: 1) |
| `sortBy` | string | `createdAt` | Field to sort by |
| `order` | `ASC` \| `DESC` | `ASC` | Sort direction |
| `search` | string | — | Full-text search on name/relevant fields |

Paginated response shape:
```json
{
  "items": [],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Frontend Integration Guide

### 1. Axios setup

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,         // Required for cookie auth
  headers: { 'Content-Type': 'application/json' },
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Fetch setup

```typescript
const BASE_URL = 'http://localhost:3000/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',                           // Required for cookie auth
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  const body = await res.json();

  if (!res.ok || body.statusCode !== 10000) {
    throw new Error(body.message ?? 'Request failed');
  }

  return body.data;
}
```

### 3. Authentication flow

```typescript
// Login
await api.post('/auth/login', { email, password });
// Cookie is now set automatically by the browser

// Logout
await api.post('/auth/logout');
// Cookie is cleared

// Check if logged in — make a request; 401 means session expired/not logged in
```

### 4. CORS setup (if frontend is on a different port)

The backend sets `Access-Control-Allow-Credentials: true`. Your frontend origin must be set in the server's `CORS_ORIGIN` env var. Wildcard origins (`*`) are not compatible with `credentials: include`.

### 5. Typical product setup workflow

```
1. Create ProductGroup (with fields)           POST /api/product-groups
2. Create ProductAttribute (with values)       POST /api/product-attributes
3. Create Department / Category / SubCategory  POST /api/departments, /categories, /sub-categories
4. Create Product (assign groupId)             POST /api/products
5. Set Group Field Values on product           PUT  /api/products/:id/group-field-values
6. Generate Lot Matrix (creates variants)      POST /api/products/:id/variants/generate-matrix
7. Update variant prices/stock                 PATCH /api/products/:id/variants/:variantId
```

### 6. Checking response success

```typescript
const res = await api.post('/departments', { name: 'Electronics' });
// res.data = { statusCode: 10000, message: 'Success', data: { id: '...', name: 'Electronics', ... } }
const department = res.data.data;
```

### 7. Handling validation errors

```typescript
try {
  await api.post('/products', payload);
} catch (err) {
  if (err.response?.status === 400) {
    // err.response.data.message contains the validation message string
    console.error(err.response.data.message);
    // e.g. "name must be a string", "sku should not be empty"
  }
  if (err.response?.status === 409) {
    // Duplicate — show conflict message
    console.error('Already exists:', err.response.data.message);
  }
}
```

### 8. Seeded roles (use these IDs after `npm run seed`)

After running `npm run seed`, query `GET /api/roles` to get the role IDs. The three roles created are:
- **Admin** — full access
- **Staff** — read + group field value write
- **Viewer** — read only

Pass the desired `roleId` when registering a user via `POST /api/auth/registration`.

---

*Generated from live API verification — 2026-03-22*
