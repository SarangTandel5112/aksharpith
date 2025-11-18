# Product Schema Enhancement - Implementation Status

## ✅ COMPLETED (Backend - Phase 1)

### 1. New Database Entities Created
All entities have been created with proper TypeORM decorators, indexes, and relationships:

- ✅ **Department Entity** (`backend/src/entities/department.entity.ts`)
  - Fields: id, departmentName, departmentCode, description, isActive
  - Indexes: unique department_name, unique department_code, is_active
  - Relationship: One-to-Many with Products

- ✅ **SubCategory Entity** (`backend/src/entities/sub-category.entity.ts`)
  - Fields: id, subCategoryName, categoryId, description, photo, displayOrder, isActive
  - Indexes: unique (categoryId + subCategoryName), composite indexes
  - Relationships: Many-to-One with ProductCategory, One-to-Many with Products

- ✅ **ProductMedia Entity** (`backend/src/entities/product-media.entity.ts`)
  - Fields: id, productId, mediaUrl, mediaType, displayOrder, isPrimary, fileSize, fileName
  - Constraint: Max 6 photos per product, only one primary photo
  - Relationship: Many-to-One with Product (CASCADE delete)

- ✅ **ProductMarketingMedia Entity** (`backend/src/entities/product-marketing-media.entity.ts`)
  - Fields: id, productId, mediaUrl, mediaType, displayOrder, thumbnailUrl, duration, fileSize
  - Supports: Up to 10 marketing photos and videos
  - Relationship: Many-to-One with Product (CASCADE delete)

- ✅ **ProductVendor Entity** (`backend/src/entities/product-vendor.entity.ts`)
  - Fields: id, productId, vendorName, contactPerson, contactEmail, contactPhone, gstin, address, isPrimary, notes, isActive
  - Constraint: Only one primary vendor per product
  - Relationship: Many-to-One with Product (CASCADE delete)

- ✅ **ProductZone Entity** (`backend/src/entities/product-zone.entity.ts`)
  - Fields: id, productId, zoneName, zoneCode, description, isActive
  - Constraint: Unique zone_code per product
  - Relationship: Many-to-One with Product (CASCADE delete)

- ✅ **ProductPhysicalAttributes Entity** (`backend/src/entities/product-physical-attributes.entity.ts`)
  - Fields: id, productId, height, length, width, weight, color
  - Supports: Multiple variants for Lot Matrix products
  - Relationship: Many-to-One with Product (CASCADE delete)

### 2. Updated Existing Entities

- ✅ **Product Entity** - Completely rewritten with new schema:
  - Core fields: productCode, upcCode, productName, productType, description, model
  - Relationships: departmentId, subCategoryId (RESTRICT delete)
  - Inventory: size, pack, vintage, hsnCode, unitPrice, stockQuantity
  - GST fields: gst1Sgst, gst1Slab, gst2Cgst, gst2Slab, gst3Igst, gst3Slab, nonTaxable
  - Status flags: itemInactive, nonStockItem, isActive
  - Relations: department, subCategory, media, marketingMedia, vendors, zones, physicalAttributes

- ✅ **ProductCategory Entity** - Updated:
  - Added relationship: One-to-Many with SubCategories
  - Added proper indexes

### 3. Helper Functions Created

- ✅ **GST Helper** (`backend/src/helpers/gst.helper.ts`)
  - `calculatePriceWithGST()` - Calculates total price with GST breakdown
  - `validateGSTConfiguration()` - Validates GST rules (SGST+CGST or IGST, non-taxable logic)
  - `getStockStatus()` - Returns stock status based on quantity and flags
  - `canDisplayProduct()` - Determines product visibility
  - `generateProductCode()` - Auto-generates product codes
  - GST_SLABS constant: ['0%', '0.25%', '3%', '5%', '12%', '18%', '28%']

### 4. New Backend Modules Created

- ✅ **Department Module** (`backend/src/modules/department/`)
  - DTOs: CreateDepartmentDto, UpdateDepartmentDto, QueryDepartmentDto
  - Repository: DepartmentRepository (extends BaseRepository)
  - Service: DepartmentService with CRUD operations
  - Controller: DepartmentController using BaseController helpers
  - Routes: /departments (GET, POST, PUT, DELETE, /stats/count)

- ✅ **SubCategory Module** (`backend/src/modules/sub-category/`)
  - DTOs: CreateSubCategoryDto, UpdateSubCategoryDto, QuerySubCategoryDto
  - Repository: SubCategoryRepository (extends BaseRepository)
  - Service: SubCategoryService with CRUD operations
  - Controller: SubCategoryController using BaseController helpers
  - Routes: /sub-categories (GET, POST, PUT, DELETE, /stats/count)

### 5. Routes Updated

- ✅ Routes index updated to include:
  - `/departments` - Department CRUD
  - `/sub-categories` - SubCategory CRUD

---

## 🔧 REMAINING WORK (Backend)

### 1. Fix TypeScript Build Errors

**Priority: HIGH**

The build currently has errors that need fixing:

1. **Path Aliases** - Most fixed, but verify all imports use:
   - `@config/` not `@/config/`
   - `@entities/` not `@/entities/`
   - `@middlewares/` not `@/middleware/`
   - `@common/` not `@/common/`
   - `@helpers/` not `@/helpers/`

2. **Validation Middleware** - Category/Product routes use `validationMiddleware(Dto, 'query')` with 2 params
   - Need to either remove second param or update our routes to match

3. **Auth Service** - JWT userId type mismatch (string vs number)
   - Already fixed in previous session, verify it's correct

4. **Product Service** - zones field type mismatch
   - CreateProductDto/UpdateProductDto likely have `zones: number[]`
   - Product entity has `zones: ProductZone[]`
   - Need to update Product DTOs to handle zone creation properly

### 2. Update Product Module

**Files to Modify:**

- `backend/src/modules/product/dtos/create-product.dto.ts`
- `backend/src/modules/product/dtos/update-product.dto.ts`
- `backend/src/modules/product/product.service.ts`
- `backend/src/modules/product/product.repository.ts`

**Changes Needed:**

Add all new fields to Product DTOs:
```typescript
// New fields to add:
productCode: string;
upcCode: string;
productType?: 'Standard' | 'Lot Matrix';
model?: string;
departmentId: number;
subCategoryId: number;  // Replace categoryId
size?: string;
pack?: string;
vintage?: string;
hsnCode: string;
unitPrice: number;
gst1Sgst: boolean;
gst1Slab: string;
gst2Cgst: boolean;
gst2Slab: string;
gst3Igst: boolean;
gst3Slab: string;
nonTaxable: boolean;
itemInactive: boolean;
nonStockItem: boolean;

// Related entities (create separately):
media?: CreateProductMediaDto[];
marketingMedia?: CreateProductMarketingMediaDto[];
vendors?: CreateProductVendorDto[];
zones?: CreateProductZoneDto[];
physicalAttributes?: CreateProductPhysicalAttributesDto[];
```

### 3. Create Additional Modules (Optional - for full CRUD)

If you want full frontend CRUD for all entities:

- **ProductMedia Module** - Manage product photos
- **ProductVendor Module** - Manage vendor relationships
- **ProductZone Module** - Manage zone assignments

OR handle these as nested resources within the Product module (recommended).

### 4. Database Migrations

**Priority: HIGH**

Since `synchronize: true` is enabled in development, TypeORM will auto-create tables. However, for production:

1. **Backup existing database** first!
2. **Test in development** - Start the backend server, TypeORM will create all new tables
3. **Verify data integrity** - Existing products will fail foreign key constraints (no departmentId, subCategoryId)
4. **Data Migration Script Needed** - Create a migration to:
   - Add default department
   - Create sub-categories from existing categories
   - Update existing products with departmentId and subCategoryId
   - Add default values for new required fields (productCode, upcCode, hsnCode, GST fields)

**Sample Migration Logic:**
```typescript
// 1. Create default department
const defaultDept = await departmentRepo.save({
  departmentName: 'General',
  departmentCode: 'GEN',
  description: 'Default department for existing products'
});

// 2. For each existing category, create a default sub-category
for (const category of categories) {
  await subCategoryRepo.save({
    categoryId: category.id,
    subCategoryName: 'General',
    description: `Default sub-category for ${category.categoryName}`
  });
}

// 3. Update existing products
for (const product of products) {
  const subCategory = await subCategoryRepo.findOne({
    where: { categoryId: product.categoryId }
  });

  await productRepo.update(product.id, {
    departmentId: defaultDept.id,
    subCategoryId: subCategory.id,
    productCode: await GSTHelper.generateProductCode(),
    upcCode: `UPC${Date.now()}${product.id}`,
    hsnCode: '00000000',
    unitPrice: product.price || 0,
    gst3Igst: true,
    gst3Slab: '18%',
    gst1Slab: '0%',
    gst2Slab: '0%',
    nonTaxable: false,
    itemInactive: false,
    nonStockItem: false
  });
}
```

### 5. API Testing

Test all new endpoints:
```bash
# Departments
GET    /api/departments
GET    /api/departments/:id
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
GET    /api/departments/stats/count

# Sub-Categories
GET    /api/sub-categories
GET    /api/sub-categories?categoryId=1
GET    /api/sub-categories/:id
POST   /api/sub-categories
PUT    /api/sub-categories/:id
DELETE /api/sub-categories/:id
GET    /api/sub-categories/stats/count?categoryId=1

# Products (updated)
GET    /api/products  # Now returns products with department, subCategory
POST   /api/products  # Now requires all new fields
```

---

## 📱 FRONTEND IMPLEMENTATION (To Do)

### 1. Create Frontend API Modules

Create using the existing API factory pattern:

**`frontend/lib/api/departments.api.ts`**
```typescript
import { createCrudApi } from './api.factory';

export interface Department {
  id: number;
  departmentName: string;
  departmentCode: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDepartmentDto {
  departmentName: string;
  departmentCode?: string;
  description?: string;
  isActive?: boolean;
}

export const departmentsApi = createCrudApi<Department, CreateDepartmentDto, Partial<Department>>('/departments');
```

**`frontend/lib/api/sub-categories.api.ts`**
```typescript
import { createCrudApi } from './api.factory';

export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;
  description: string | null;
  photo: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateSubCategoryDto {
  subCategoryName: string;
  categoryId: number;
  description?: string;
  photo?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const subCategoriesApi = createCrudApi<SubCategory, CreateSubCategoryDto, Partial<SubCategory>>('/sub-categories');
```

### 2. Create Frontend Hooks

**`frontend/modules/departments/hooks/useDepartments.ts`**
**`frontend/modules/sub-categories/hooks/useSubCategories.ts`**

Follow the same pattern as `useCategories` and `useProducts`.

### 3. Create Frontend Pages

**Department Management:**
- `frontend/app/(main)/admin/departments/page.tsx`
- Copy structure from `/admin/categories`
- DataTable with columns: Name, Code, Description, Active, Actions
- Add/Edit dialog with form fields

**SubCategory Management:**
- `frontend/app/(main)/admin/sub-categories/page.tsx`
- Add dropdown filter for Category
- DataTable with columns: Name, Category, Display Order, Active, Actions
- Add/Edit dialog with category selector

### 4. Update Product Form

**File:** `frontend/app/(main)/admin/products/page.tsx`

**New Form Fields to Add:**

1. **Basic Info Section:**
   - Product Code (auto-generated button)
   - UPC Code
   - Product Type (dropdown: Standard/Lot Matrix)
   - Model Number

2. **Classification Section:**
   - Department (dropdown) ⭐ REQUIRED
   - Category (dropdown)
   - Sub-Category (dropdown - filtered by category) ⭐ REQUIRED

3. **Additional Details:**
   - Size (dropdown: XS, S, M, L, XL, XXL, XXXL, Free Size, Custom)
   - Pack
   - Vintage

4. **Pricing & Inventory:**
   - HSN Code ⭐ REQUIRED
   - Unit Price (decimal, 12,2) ⭐ REQUIRED
   - Stock Quantity ⭐ REQUIRED

5. **GST Configuration Section:**
   - Non-Taxable (checkbox)
   - SGST (checkbox + slab dropdown)
   - CGST (checkbox + slab dropdown)
   - IGST (checkbox + slab dropdown)
   - Validation: SGST+CGST OR IGST (mutually exclusive)

6. **Status Flags:**
   - Item Inactive (checkbox)
   - Non-Stock Item (checkbox)

7. **Related Data Sections:**
   - Product Photos (upload up to 6, mark primary)
   - Marketing Media (photos/videos, up to 10)
   - Vendors (add multiple, mark primary)
   - Zones (assign multiple)
   - Physical Attributes (for Lot Matrix products)

**Form Validation:**
- Use GST validation from backend
- Department + SubCategory required
- ProductCode + UPCCode must be unique
- HSN code must be 4, 6, or 8 digits

### 5. Update Navigation Menu

Add menu items for:
- Departments
- Sub-Categories

Update Products menu to show it uses the new schema.

---

## 🗂️ FILES CREATED/MODIFIED

### Backend Files Created:
```
backend/src/entities/
  - department.entity.ts
  - sub-category.entity.ts
  - product-media.entity.ts
  - product-marketing-media.entity.ts
  - product-vendor.entity.ts
  - product-zone.entity.ts
  - product-physical-attributes.entity.ts

backend/src/helpers/
  - gst.helper.ts

backend/src/modules/department/
  - dtos/create-department.dto.ts
  - dtos/update-department.dto.ts
  - dtos/query-department.dto.ts
  - dtos/index.ts
  - department.repository.ts
  - department.service.ts
  - department.controller.ts
  - department.routes.ts
  - department.module.ts

backend/src/modules/sub-category/
  - dtos/create-sub-category.dto.ts
  - dtos/update-sub-category.dto.ts
  - dtos/query-sub-category.dto.ts
  - dtos/index.ts
  - sub-category.repository.ts
  - sub-category.service.ts
  - sub-category.controller.ts
  - sub-category.routes.ts
  - sub-category.module.ts
```

### Backend Files Modified:
```
backend/src/entities/
  - index.ts (added new entity exports)
  - product.entity.ts (complete rewrite)
  - product-category.entity.ts (added subCategories relation)

backend/src/routes/
  - index.ts (added department and sub-category routes)
```

### Frontend Files To Create:
```
frontend/lib/api/
  - departments.api.ts
  - sub-categories.api.ts

frontend/modules/departments/
  - hooks/useDepartments.ts
  - hooks/index.ts

frontend/modules/sub-categories/
  - hooks/useSubCategories.ts
  - hooks/index.ts

frontend/app/(main)/admin/
  - departments/page.tsx
  - sub-categories/page.tsx
```

### Frontend Files To Update:
```
frontend/app/(main)/admin/products/page.tsx
  - Update form with all new fields
  - Add GST validation
  - Add department/subcategory dropdowns

frontend/lib/api/products.api.ts
  - Update Product interface with new fields
  - Update CreateProductDto
  - Update UpdateProductDto
```

---

## 📋 NEXT STEPS (Priority Order)

1. **Fix TypeScript Build Errors** (30 minutes)
   - Fix remaining path imports
   - Fix product service zones type issue
   - Test build passes

2. **Create Data Migration Script** (1 hour)
   - Create default department
   - Create default sub-categories
   - Migrate existing products
   - Add default values for required fields

3. **Test Backend** (30 minutes)
   - Start server
   - Test department CRUD
   - Test sub-category CRUD
   - Test product listing

4. **Frontend API Modules** (30 minutes)
   - Create departments.api.ts
   - Create sub-categories.api.ts
   - Create hooks

5. **Frontend Pages** (2-3 hours)
   - Create departments page
   - Create sub-categories page
   - Update products form (biggest task)

6. **Testing & Polish** (1 hour)
   - Test all CRUD operations
   - Test GST calculations
   - Test form validations
   - Test data relationships

---

## 🎯 CURRENT STATUS SUMMARY

### ✅ Completed:
- All database entities created (7 new + 2 updated)
- GST helper with calculation and validation logic
- Department module (complete CRUD)
- SubCategory module (complete CRUD)
- Routes registered

### ⚠️ In Progress:
- Fixing TypeScript build errors

### ❌ Not Started:
- Product DTOs update
- Data migration script
- Frontend implementation

### 🔢 Estimated Time to Completion:
- Backend fixes & testing: **2-3 hours**
- Frontend implementation: **3-4 hours**
- **Total: 5-7 hours of development work**

---

## 📚 IMPORTANT NOTES

1. **Database Schema Changes**: This is a BREAKING change. Existing products in production will need migration.

2. **GST Rules**: The schema enforces Indian GST rules:
   - Intra-state: SGST + CGST (both must have same rate)
   - Inter-state: IGST only
   - Non-taxable: All GST flags false

3. **Product Codes**: Auto-generation format: `[DEPT][CAT][TIMESTAMP][RANDOM]`
   - Example: `AB12123456` (AB=dept, 12=cat, 1234=timestamp, 56=random)

4. **Relationships**:
   - RESTRICT: Cannot delete Department/SubCategory/Category if products exist
   - CASCADE: Deleting product removes all media, vendors, zones, attributes

5. **Stock Status Logic**:
   - `isActive=false`: Archived (not visible)
   - `itemInactive=true`: Temporarily unavailable
   - `nonStockItem=true`: Service/Digital (no inventory tracking)

6. **Media Constraints**:
   - Product Photos: Max 6, only 1 primary
   - Marketing Media: Up to 10 (photos + videos)

---

## 🤝 READY FOR NEXT SESSION

This document serves as a checkpoint. In the next session, you can:
1. Ask me to fix the remaining backend build errors
2. Ask me to create the frontend implementation
3. Ask me to create the data migration script
4. Ask me to test the entire flow

All the groundwork is done - entities, relationships, helpers, and two complete modules as examples.
