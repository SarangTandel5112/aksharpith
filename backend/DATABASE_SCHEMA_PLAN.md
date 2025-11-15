# Product Management Database Schema Plan

## Overview

This document outlines the database tables required for the comprehensive product management system.

> **✅ Important Update:** This schema uses the **existing `product_categories` table** for main categories instead of creating a new "departments" table. All field references have been updated accordingly. Custom fields will be category-specific.

---

## Table Structures

### Phase 1: Core Tables (Must Have)

#### 1. `sub_categories`

**Purpose:** Sub-categories under main categories

| Column            | Type         | Constraints                 | Description              |
| ----------------- | ------------ | --------------------------- | ------------------------ |
| id                | INT          | PK, AUTO_INCREMENT          | Primary key              |
| sub_category_name | VARCHAR(100) | NOT NULL                    | Sub-category name        |
| category_id       | INT          | FK → product_categories(id) | Parent category          |
| description       | TEXT         | NULLABLE                    | Sub-category description |
| photo             | VARCHAR(255) | NULLABLE                    | Sub-category image URL   |
| display_order     | INT          | DEFAULT 0                   | Display order            |
| is_active         | BOOLEAN      | DEFAULT true                | Active status            |
| created_at        | TIMESTAMP    | NOT NULL                    | Creation timestamp       |
| updated_at        | TIMESTAMP    | NULLABLE                    | Last update timestamp    |

**Indexes:**

- Primary: `id`
- Foreign Key: `category_id` → `product_categories(id)` ON DELETE CASCADE
- Index: `category_id`, `is_active`

---

#### 2. `zones`

**Purpose:** Store zones for product location/assignment

| Column      | Type         | Constraints        | Description           |
| ----------- | ------------ | ------------------ | --------------------- |
| id          | INT          | PK, AUTO_INCREMENT | Primary key           |
| zone_name   | VARCHAR(100) | NOT NULL, UNIQUE   | Zone name             |
| zone_code   | VARCHAR(20)  | UNIQUE             | Short code for zone   |
| description | TEXT         | NULLABLE           | Zone description      |
| is_active   | BOOLEAN      | DEFAULT true       | Active status         |
| created_at  | TIMESTAMP    | NOT NULL           | Creation timestamp    |
| updated_at  | TIMESTAMP    | NULLABLE           | Last update timestamp |

**Indexes:**

- Primary: `id`
- Unique: `zone_name`, `zone_code`
- Index: `is_active`

---

#### 3. `product_zones` (Junction Table)

**Purpose:** Many-to-many relationship between products and zones

| Column     | Type      | Constraints                 | Description        |
| ---------- | --------- | --------------------------- | ------------------ |
| id         | INT       | PK, AUTO_INCREMENT          | Primary key        |
| product_id | INT       | FK → products(id), NOT NULL | Product reference  |
| zone_id    | INT       | FK → zones(id), NOT NULL    | Zone reference     |
| created_at | TIMESTAMP | NOT NULL                    | Creation timestamp |

**Indexes:**

- Primary: `id`
- Foreign Keys:
  - `product_id` → `products(id)` ON DELETE CASCADE
  - `zone_id` → `zones(id)` ON DELETE CASCADE
- Unique: `(product_id, zone_id)` - prevent duplicate assignments
- Index: `product_id`, `zone_id`

---

#### 4. `product_media`

**Purpose:** Store product photos (up to 6 per product)

| Column        | Type         | Constraints                 | Description             |
| ------------- | ------------ | --------------------------- | ----------------------- |
| id            | INT          | PK, AUTO_INCREMENT          | Primary key             |
| product_id    | INT          | FK → products(id), NOT NULL | Product reference       |
| media_url     | VARCHAR(500) | NOT NULL                    | Image URL (S3 or other) |
| media_type    | ENUM         | 'photo'                     | Media type              |
| display_order | INT          | DEFAULT 0                   | Display order (1-6)     |
| is_primary    | BOOLEAN      | DEFAULT false               | Primary product photo   |
| file_size     | INT          | NULLABLE                    | File size in bytes      |
| file_name     | VARCHAR(255) | NULLABLE                    | Original file name      |
| created_at    | TIMESTAMP    | NOT NULL                    | Creation timestamp      |
| updated_at    | TIMESTAMP    | NULLABLE                    | Last update timestamp   |

**Indexes:**

- Primary: `id`
- Foreign Key: `product_id` → `products(id)` ON DELETE CASCADE
- Index: `product_id`, `is_primary`

**Constraints:**

- Max 6 photos per product (enforced at application level)
- Only one `is_primary` per product (enforced at application level)

---

#### 5. `product_marketing_media`

**Purpose:** Store marketing photos (up to 10) and videos

| Column        | Type         | Constraints                 | Description                |
| ------------- | ------------ | --------------------------- | -------------------------- |
| id            | INT          | PK, AUTO_INCREMENT          | Primary key                |
| product_id    | INT          | FK → products(id), NOT NULL | Product reference          |
| media_url     | VARCHAR(500) | NOT NULL                    | Media URL (image or video) |
| media_type    | ENUM         | 'photo', 'video'            | Media type                 |
| display_order | INT          | DEFAULT 0                   | Display order              |
| thumbnail_url | VARCHAR(500) | NULLABLE                    | Video thumbnail URL        |
| duration      | INT          | NULLABLE                    | Video duration in seconds  |
| file_size     | INT          | NULLABLE                    | File size in bytes         |
| created_at    | TIMESTAMP    | NOT NULL                    | Creation timestamp         |
| updated_at    | TIMESTAMP    | NULLABLE                    | Last update timestamp      |

**Indexes:**

- Primary: `id`
- Foreign Key: `product_id` → `products(id)` ON DELETE CASCADE
- Index: `product_id`, `media_type`

**Constraints:**

- Max 10 photos per product (enforced at application level)
- Unlimited videos (or set limit as needed)

---

### Phase 2: Lookup Tables (Should Have)

#### 6. `product_sizes`

**Purpose:** Predefined sizes (S, M, L, XL, etc.)

| Column        | Type        | Constraints        | Description                      |
| ------------- | ----------- | ------------------ | -------------------------------- |
| id            | INT         | PK, AUTO_INCREMENT | Primary key                      |
| size_name     | VARCHAR(50) | NOT NULL, UNIQUE   | e.g., "Small", "Medium", "Large" |
| size_code     | VARCHAR(10) | UNIQUE             | e.g., "S", "M", "L", "XL"        |
| display_order | INT         | DEFAULT 0          | Display order                    |
| is_active     | BOOLEAN     | DEFAULT true       | Active status                    |
| created_at    | TIMESTAMP   | NOT NULL           | Creation timestamp               |
| updated_at    | TIMESTAMP   | NULLABLE           | Last update timestamp            |

**Predefined Data:**

```sql
INSERT INTO product_sizes (size_name, size_code, display_order) VALUES
('Extra Small', 'XS', 1),
('Small', 'S', 2),
('Medium', 'M', 3),
('Large', 'L', 4),
('Extra Large', 'XL', 5),
('XXL', 'XXL', 6);
```

---

#### 7. `product_packs`

**Purpose:** Pack or bundle information

| Column        | Type         | Constraints        | Description               |
| ------------- | ------------ | ------------------ | ------------------------- |
| id            | INT          | PK, AUTO_INCREMENT | Primary key               |
| pack_name     | VARCHAR(100) | NOT NULL, UNIQUE   | e.g., "6 Pack", "12 Pack" |
| pack_code     | VARCHAR(20)  | UNIQUE             | Short code                |
| pack_quantity | INT          | NOT NULL           | Quantity in pack          |
| description   | TEXT         | NULLABLE           | Pack description          |
| is_active     | BOOLEAN      | DEFAULT true       | Active status             |
| created_at    | TIMESTAMP    | NOT NULL           | Creation timestamp        |
| updated_at    | TIMESTAMP    | NULLABLE           | Last update timestamp     |

---

#### 8. `vendors`

**Purpose:** Supplier/Vendor information

| Column         | Type         | Constraints        | Description               |
| -------------- | ------------ | ------------------ | ------------------------- |
| id             | INT          | PK, AUTO_INCREMENT | Primary key               |
| vendor_name    | VARCHAR(150) | NOT NULL, UNIQUE   | Vendor/Supplier name      |
| vendor_code    | VARCHAR(20)  | UNIQUE             | Short code                |
| contact_person | VARCHAR(100) | NULLABLE           | Contact person name       |
| contact_email  | VARCHAR(100) | NULLABLE           | Contact email             |
| contact_phone  | VARCHAR(20)  | NULLABLE           | Contact phone             |
| gstin          | VARCHAR(15)  | NULLABLE           | GST Identification Number |
| address_line1  | VARCHAR(255) | NULLABLE           | Address line 1            |
| address_line2  | VARCHAR(255) | NULLABLE           | Address line 2            |
| city           | VARCHAR(100) | NULLABLE           | City                      |
| state          | VARCHAR(100) | NULLABLE           | State                     |
| postal_code    | VARCHAR(10)  | NULLABLE           | Postal/ZIP code           |
| country        | VARCHAR(100) | DEFAULT 'India'    | Country                   |
| is_active      | BOOLEAN      | DEFAULT true       | Active status             |
| created_at     | TIMESTAMP    | NOT NULL           | Creation timestamp        |
| updated_at     | TIMESTAMP    | NULLABLE           | Last update timestamp     |

**Indexes:**

- Primary: `id`
- Unique: `vendor_name`, `vendor_code`, `gstin`
- Index: `is_active`

---

#### 9. `product_vendors` (Junction Table)

**Purpose:** Link products to vendors (many-to-many)

| Column             | Type          | Constraints                 | Description               |
| ------------------ | ------------- | --------------------------- | ------------------------- |
| id                 | INT           | PK, AUTO_INCREMENT          | Primary key               |
| product_id         | INT           | FK → products(id), NOT NULL | Product reference         |
| vendor_id          | INT           | FK → vendors(id), NOT NULL  | Vendor reference          |
| is_primary         | BOOLEAN       | DEFAULT false               | Primary vendor flag       |
| cost_price         | DECIMAL(10,2) | NULLABLE                    | Purchase cost from vendor |
| lead_time_days     | INT           | NULLABLE                    | Lead time in days         |
| min_order_quantity | INT           | NULLABLE                    | Minimum order quantity    |
| notes              | TEXT          | NULLABLE                    | Additional notes          |
| created_at         | TIMESTAMP     | NOT NULL                    | Creation timestamp        |
| updated_at         | TIMESTAMP     | NULLABLE                    | Last update timestamp     |

**Indexes:**

- Primary: `id`
- Foreign Keys:
  - `product_id` → `products(id)` ON DELETE CASCADE
  - `vendor_id` → `vendors(id)` ON DELETE CASCADE
- Unique: `(product_id, vendor_id)`
- Index: `product_id`, `vendor_id`, `is_primary`

---

### Phase 3: Enhanced Features (Nice to Have)

#### 10. `category_custom_fields`

**Purpose:** Define custom fields for each category

| Column           | Type         | Constraints                                                  | Description                       |
| ---------------- | ------------ | ------------------------------------------------------------ | --------------------------------- |
| id               | INT          | PK, AUTO_INCREMENT                                           | Primary key                       |
| category_id      | INT          | FK → product_categories(id), NOT NULL                        | Category reference                |
| field_name       | VARCHAR(100) | NOT NULL                                                     | Field name (database key)         |
| field_label      | VARCHAR(100) | NOT NULL                                                     | Display label                     |
| field_type       | ENUM         | 'text', 'number', 'dropdown', 'textarea', 'date', 'checkbox' | Field type                        |
| field_options    | JSON         | NULLABLE                                                     | Options for dropdown (JSON array) |
| is_required      | BOOLEAN      | DEFAULT false                                                | Required field                    |
| display_order    | INT          | DEFAULT 0                                                    | Display order                     |
| validation_rules | JSON         | NULLABLE                                                     | Validation rules (JSON)           |
| is_active        | BOOLEAN      | DEFAULT true                                                 | Active status                     |
| created_at       | TIMESTAMP    | NOT NULL                                                     | Creation timestamp                |
| updated_at       | TIMESTAMP    | NULLABLE                                                     | Last update timestamp             |

**Indexes:**

- Primary: `id`
- Foreign Key: `category_id` → `product_categories(id)` ON DELETE CASCADE
- Unique: `(category_id, field_name)`
- Index: `category_id`, `is_active`

---

#### 11. `product_custom_field_values`

**Purpose:** Store actual values for category custom fields

| Column          | Type      | Constraints                               | Description                  |
| --------------- | --------- | ----------------------------------------- | ---------------------------- |
| id              | INT       | PK, AUTO_INCREMENT                        | Primary key                  |
| product_id      | INT       | FK → products(id), NOT NULL               | Product reference            |
| custom_field_id | INT       | FK → category_custom_fields(id), NOT NULL | Custom field reference       |
| field_value     | TEXT      | NULLABLE                                  | Field value (stored as text) |
| created_at      | TIMESTAMP | NOT NULL                                  | Creation timestamp           |
| updated_at      | TIMESTAMP | NULLABLE                                  | Last update timestamp        |

**Indexes:**

- Primary: `id`
- Foreign Keys:
  - `product_id` → `products(id)` ON DELETE CASCADE
  - `custom_field_id` → `category_custom_fields(id)` ON DELETE CASCADE
- Unique: `(product_id, custom_field_id)`
- Index: `product_id`, `custom_field_id`

---

#### 12. `product_history`

**Purpose:** Track changes to products (audit log)

| Column      | Type         | Constraints                                                 | Description              |
| ----------- | ------------ | ----------------------------------------------------------- | ------------------------ |
| id          | INT          | PK, AUTO_INCREMENT                                          | Primary key              |
| product_id  | INT          | FK → products(id), NOT NULL                                 | Product reference        |
| changed_by  | INT          | FK → users(id), NOT NULL                                    | User who made the change |
| change_type | ENUM         | 'created', 'updated', 'deleted', 'activated', 'deactivated' | Type of change           |
| changes     | JSON         | NOT NULL                                                    | Changes made (JSON diff) |
| ip_address  | VARCHAR(45)  | NULLABLE                                                    | IP address of user       |
| user_agent  | VARCHAR(255) | NULLABLE                                                    | Browser user agent       |
| created_at  | TIMESTAMP    | NOT NULL                                                    | Change timestamp         |

**Indexes:**

- Primary: `id`
- Foreign Keys:
  - `product_id` → `products(id)` ON DELETE CASCADE
  - `changed_by` → `users(id)` ON DELETE SET NULL
- Index: `product_id`, `changed_by`, `change_type`, `created_at`

---

## Product Entity Updates Required

After creating these tables, update the `products` table:

### Remove JSON Columns (Replace with Relations):

- ❌ `product_photos` (JSON) → ✅ `product_media` table
- ❌ `marketing_photos` (JSON) → ✅ `product_marketing_media` table
- ❌ `marketing_videos` (JSON) → ✅ `product_marketing_media` table
- ❌ `zones` (JSON) → ✅ `product_zones` table
- ❌ `custom_fields` (JSON) → ✅ `product_custom_field_values` table

### Change to Foreign Keys:

- ✅ `category_id` → Already FK to `product_categories(id)` (existing)
- ✅ `sub_category_id` → FK to `sub_categories(id)`
- ✅ `size` → Change to `size_id` FK to `product_sizes(id)` (optional)
- ✅ `pack_id` → FK to `product_packs(id)`
- ✅ `product_type` → Stored directly as VARCHAR(20) enum field in products table (Standard or Lot Matrix)
- ✅ `gst_1_slab`, `gst_2_slab`, `gst_3_slab` → Stored directly as VARCHAR(50) in products table

### Keep as VARCHAR/TEXT:

- ✅ `product_code`
- ✅ `upc_code`
- ✅ `hsn_code`
- ✅ `vendor_details` (or move to `product_vendors`)
- ✅ Physical attributes (height, length, width, weight, color)

---

## Implementation Order

### Sprint 1 (Week 1):

1. Create `sub_categories` table and entity
2. Create `zones` + `product_zones` tables and entities
3. Seed initial data for above tables

### Sprint 2 (Week 2):

4. Create `product_media` table and entity
5. Create `product_marketing_media` table and entity
6. Create `product_sizes` table and entity
7. Create `product_packs` table and entity

### Sprint 3 (Week 3):

8. Create `vendors` + `product_vendors` tables and entities
9. Update `products` entity to use foreign keys
10. Create migration to transform JSON data to relational tables

### Sprint 4 (Week 4 - Optional):

11. Create `category_custom_fields` table
12. Create `product_custom_field_values` table
13. Create `product_history` table
14. Implement audit logging

---

## Benefits of This Approach

### ✅ Data Integrity

- Foreign key constraints prevent orphaned records
- Cascading deletes maintain referential integrity
- Unique constraints prevent duplicates

### ✅ Performance

- Proper indexes on foreign keys
- No JSON parsing required
- Efficient JOINs instead of JSON operations

### ✅ Scalability

- No array size limits
- Easy to add new media without schema changes
- Can add indexes as needed

### ✅ Maintainability

- Clear relationships between entities
- Easy to understand schema
- Standard CRUD operations

### ✅ Flexibility

- Easy to add/modify zones, vendors
- Can create management UIs for lookup tables
- Category-specific custom fields

### ✅ Reporting

- Easy to generate reports
- Can aggregate data efficiently
- Better analytics capabilities

---

## Migration Strategy

### Option 1: Fresh Start (Recommended if no production data)

1. Drop existing `products` table
2. Create all new tables
3. Recreate `products` with proper foreign keys
4. Seed initial data

### Option 2: Gradual Migration (If production data exists)

1. Create all new tables
2. Keep both JSON and relational columns temporarily
3. Write migration script to move JSON → tables
4. Update API to use new relations
5. Test thoroughly
6. Remove JSON columns after verification

---

## Next Steps

1. ✅ Review this schema plan
2. ⏭️ Create entities for Phase 1 tables
3. ⏭️ Create TypeORM migrations
4. ⏭️ Update Product entity relationships
5. ⏭️ Create API endpoints for new entities
6. ⏭️ Update frontend to use new structure

---

**Created:** November 13, 2024  
**Version:** 1.0  
**Status:** Draft - Awaiting Approval
