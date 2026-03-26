import type {
  AdminBackendCoverageMap,
  BackendFieldOverrideMap,
  EntitySystemFieldSnapshot,
} from "@shared/types/backend-field-coverage.types";

export const ADMIN_BACKEND_FIELD_COVERAGE: AdminBackendCoverageMap = {
  departments: {
    entityLabel: "Department",
    createFields: [
      {
        key: "name",
        label: "name",
        detail: "Required string, maximum 150 characters.",
      },
    ],
    updateFields: [
      {
        key: "name",
        label: "name",
        detail: "The only editable department field in the Nest update DTO.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "isActive",
        label: "isActive",
        detail: "Set by the entity and defaults to Active.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically by Nest on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Updated automatically by Nest on every change.",
      },
    ],
    notes: ["CreateDepartmentDto and UpdateDepartmentDto only accept `name`."],
  },
  categories: {
    entityLabel: "Category",
    createFields: [
      {
        key: "name",
        label: "name",
        detail: "Required string, maximum 150 characters.",
      },
    ],
    updateFields: [
      {
        key: "name",
        label: "name",
        detail: "The only editable category field in Nest.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "isActive",
        label: "isActive",
        detail: "Entity-managed status, defaulting to Active.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: [
      "Category DTOs are flat. Department and description are not part of the final Nest contract.",
    ],
  },
  subCategories: {
    entityLabel: "Sub-category",
    createFields: [
      {
        key: "name",
        label: "name",
        detail: "Required string, maximum 150 characters.",
      },
      {
        key: "categoryId",
        label: "categoryId",
        detail: "Required UUID referencing the parent category.",
      },
    ],
    updateFields: [
      {
        key: "name",
        label: "name",
        detail: "Editable in the Nest update DTO.",
      },
      {
        key: "categoryId",
        label: "categoryId",
        detail: "Editable in the Nest update DTO.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "isActive",
        label: "isActive",
        detail: "Entity-managed status, defaulting to Active.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: [
      "The category relation is visible in the entity, but only `categoryId` is submitted through the DTO.",
    ],
  },
  roles: {
    entityLabel: "Role",
    createFields: [
      {
        key: "roleName",
        label: "roleName",
        detail: "Required string, maximum 100 characters.",
      },
    ],
    updateFields: [
      {
        key: "roleName",
        label: "roleName",
        detail: "The only editable role field in Nest.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "isActive",
        label: "isActive",
        detail: "Entity-managed status, defaulting to Active.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: [
      "Role descriptions were removed because they do not exist in the final Nest backend.",
    ],
  },
  users: {
    entityLabel: "User",
    createFields: [
      {
        key: "firstName",
        label: "firstName",
        detail: "Required string, maximum 100 characters.",
      },
      {
        key: "middleName",
        label: "middleName",
        detail: "Optional string, maximum 100 characters.",
      },
      {
        key: "lastName",
        label: "lastName",
        detail: "Required string, maximum 100 characters.",
      },
      { key: "email", label: "email", detail: "Required email address." },
      {
        key: "password",
        label: "password",
        detail: "Required on create, minimum 8 characters.",
      },
      {
        key: "roleId",
        label: "roleId",
        detail: "Required UUID linking the user to a role.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Optional boolean accepted directly by Nest.",
      },
    ],
    updateFields: [
      {
        key: "firstName",
        label: "firstName",
        detail: "Editable in the Nest update DTO.",
      },
      {
        key: "middleName",
        label: "middleName",
        detail: "Editable in the Nest update DTO.",
      },
      {
        key: "lastName",
        label: "lastName",
        detail: "Editable in the Nest update DTO.",
      },
      {
        key: "email",
        label: "email",
        detail: "Editable in the Nest update DTO.",
      },
      {
        key: "roleId",
        label: "roleId",
        detail: "Editable in the Nest update DTO.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Editable in the Nest update DTO.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: ["Password is intentionally excluded from the Nest update DTO."],
  },
  attributes: {
    entityLabel: "Product Attribute",
    createFields: [
      {
        key: "name",
        label: "name",
        detail: "Required string, maximum 150 characters.",
      },
      {
        key: "values",
        label: "values[]",
        detail: "Optional nested attribute values created with the attribute.",
      },
    ],
    updateFields: [
      {
        key: "name",
        label: "name",
        detail: "Editable on the main attribute update endpoint.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Editable on the main attribute update endpoint.",
      },
      {
        key: "values",
        label: "values[]",
        detail:
          "Value edits fan out through the dedicated attribute-value endpoints.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "isActive",
        label: "isActive",
        detail: "Defaults to Active when the entity is created.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: [
      "CreateProductAttributeDto accepts `name` and optional `values`; status becomes editable after the record exists.",
    ],
  },
  attributeValues: {
    entityLabel: "Attribute Value",
    createFields: [
      {
        key: "value",
        label: "value",
        detail: "Required string, maximum 255 characters.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Optional integer, minimum 0.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Optional boolean accepted by the value DTO.",
      },
    ],
    updateFields: [
      {
        key: "value",
        label: "value",
        detail: "Editable through the value update endpoint.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Editable through the value update endpoint.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Editable through the value update endpoint.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "attributeId",
        label: "attributeId",
        detail: "Assigned by the parent attribute endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  groups: {
    entityLabel: "Product Group",
    createFields: [
      {
        key: "name",
        label: "name",
        detail: "Required string, maximum 150 characters.",
      },
      {
        key: "fields",
        label: "fields[]",
        detail:
          "Optional nested field definitions allowed during initial group creation.",
      },
    ],
    updateFields: [
      {
        key: "name",
        label: "name",
        detail: "Editable on the group update endpoint.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Editable on the group update endpoint.",
      },
      {
        key: "fields",
        label: "fields[]",
        detail:
          "Field edits use the dedicated group-field endpoints after the group exists.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "isActive",
        label: "isActive",
        detail: "Defaults to Active when the entity is created.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: [
      "Group create accepts only `name` and optional nested `fields`.",
      "Field key is auto-generated during initial group creation; `isFilterable` is configured through the dedicated field endpoint after save.",
    ],
  },
  groupFields: {
    entityLabel: "Group Field",
    createFields: [
      {
        key: "fieldName",
        label: "fieldName",
        detail: "Required string, maximum 150 characters.",
      },
      {
        key: "fieldKey",
        label: "fieldKey",
        detail: "Optional string; auto-generated if omitted.",
      },
      {
        key: "fieldType",
        label: "fieldType",
        detail: "Optional enum: text, textarea, number, boolean, dropdown.",
      },
      { key: "isRequired", label: "isRequired", detail: "Optional boolean." },
      {
        key: "isFilterable",
        label: "isFilterable",
        detail: "Optional boolean on the dedicated add-field endpoint.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Optional integer, minimum 0.",
      },
    ],
    updateFields: [
      {
        key: "fieldName",
        label: "fieldName",
        detail: "Editable after creation.",
      },
      {
        key: "isRequired",
        label: "isRequired",
        detail: "Editable after creation.",
      },
      {
        key: "isFilterable",
        label: "isFilterable",
        detail: "Editable after creation.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Editable after creation.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "groupId",
        label: "groupId",
        detail: "Assigned by the parent group endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
    notes: [
      "`fieldKey` and `fieldType` are intentionally immutable after creation.",
    ],
  },
  groupFieldOptions: {
    entityLabel: "Group Field Option",
    createFields: [
      {
        key: "optionLabel",
        label: "optionLabel",
        detail: "Required string, maximum 100 characters.",
      },
      {
        key: "optionValue",
        label: "optionValue",
        detail: "Required string, maximum 255 characters.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Optional integer, minimum 0.",
      },
    ],
    updateFields: [
      {
        key: "optionLabel",
        label: "optionLabel",
        detail: "Editable after creation.",
      },
      {
        key: "optionValue",
        label: "optionValue",
        detail: "Editable after creation.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Editable after creation.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "fieldId",
        label: "fieldId",
        detail: "Assigned by the parent field endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  products: {
    entityLabel: "Product",
    createFields: [
      {
        key: "name",
        label: "name",
        detail: "Required string, maximum 255 characters.",
      },
      {
        key: "sku",
        label: "sku",
        detail: "Required string, maximum 100 characters.",
      },
      { key: "description", label: "description", detail: "Optional string." },
      {
        key: "productType",
        label: "productType",
        detail: "Optional enum: simple, variable, digital, service.",
      },
      {
        key: "basePrice",
        label: "basePrice",
        detail: "Optional number, minimum 0.",
      },
      {
        key: "stockQuantity",
        label: "stockQuantity",
        detail: "Optional integer, minimum 0.",
      },
      { key: "departmentId", label: "departmentId", detail: "Optional UUID." },
      {
        key: "subCategoryId",
        label: "subCategoryId",
        detail: "Optional UUID.",
      },
      { key: "groupId", label: "groupId", detail: "Optional UUID." },
      {
        key: "itemInactive",
        label: "itemInactive",
        detail: "Optional boolean.",
      },
      { key: "isActive", label: "isActive", detail: "Optional boolean." },
    ],
    updateFields: [
      {
        key: "name",
        label: "name",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "sku",
        label: "sku",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "description",
        label: "description",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "productType",
        label: "productType",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "basePrice",
        label: "basePrice",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "stockQuantity",
        label: "stockQuantity",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "departmentId",
        label: "departmentId",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "subCategoryId",
        label: "subCategoryId",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "groupId",
        label: "groupId",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "itemInactive",
        label: "itemInactive",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Editable on the product update endpoint.",
      },
      {
        key: "clearFieldValues",
        label: "clearFieldValues",
        detail: "Optional boolean used when switching product groups.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
      {
        key: "category",
        label: "category",
        detail: "Derived from the selected `subCategoryId`.",
      },
    ],
  },
  media: {
    entityLabel: "Product Media",
    createFields: [
      { key: "url", label: "url", detail: "Required asset URL." },
      {
        key: "mediaType",
        label: "mediaType",
        detail: "Optional enum: image or video.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Optional integer, minimum 0.",
      },
      { key: "isPrimary", label: "isPrimary", detail: "Optional boolean." },
    ],
    updateFields: [
      {
        key: "url",
        label: "url",
        detail: "Managed through the product media resource.",
      },
      {
        key: "mediaType",
        label: "mediaType",
        detail: "Managed through the product media resource.",
      },
      {
        key: "sortOrder",
        label: "sortOrder",
        detail: "Managed through the product media resource.",
      },
      {
        key: "isPrimary",
        label: "isPrimary",
        detail: "Managed through the product media resource.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  marketingMedia: {
    entityLabel: "Marketing Media",
    createFields: [
      { key: "mediaUrl", label: "mediaUrl", detail: "Required URL." },
      {
        key: "mediaType",
        label: "mediaType",
        detail: "Optional enum: photo or video.",
      },
      {
        key: "displayOrder",
        label: "displayOrder",
        detail: "Optional integer, minimum 0.",
      },
      {
        key: "thumbnailUrl",
        label: "thumbnailUrl",
        detail: "Optional string.",
      },
      {
        key: "duration",
        label: "duration",
        detail: "Optional integer, minimum 0.",
      },
      {
        key: "fileSize",
        label: "fileSize",
        detail: "Optional integer, minimum 0.",
      },
    ],
    updateFields: [
      {
        key: "mediaUrl",
        label: "mediaUrl",
        detail: "Managed through the marketing media resource.",
      },
      {
        key: "mediaType",
        label: "mediaType",
        detail: "Managed through the marketing media resource.",
      },
      {
        key: "displayOrder",
        label: "displayOrder",
        detail: "Managed through the marketing media resource.",
      },
      {
        key: "thumbnailUrl",
        label: "thumbnailUrl",
        detail: "Managed through the marketing media resource.",
      },
      {
        key: "duration",
        label: "duration",
        detail: "Managed through the marketing media resource.",
      },
      {
        key: "fileSize",
        label: "fileSize",
        detail: "Managed through the marketing media resource.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  variants: {
    entityLabel: "Product Variant",
    createFields: [
      { key: "sku", label: "sku", detail: "Required string." },
      { key: "price", label: "price", detail: "Required number, minimum 0." },
      {
        key: "stockQuantity",
        label: "stockQuantity",
        detail: "Optional integer, minimum 0.",
      },
      {
        key: "attributeValueIds",
        label: "attributeValueIds[]",
        detail: "Required UUID array linking attribute values.",
      },
      {
        key: "attributeIds",
        label: "attributeIds[]",
        detail: "Used by the matrix generation endpoint.",
      },
    ],
    updateFields: [
      {
        key: "price",
        label: "price",
        detail: "Editable on the variant update endpoint.",
      },
      {
        key: "stockQuantity",
        label: "stockQuantity",
        detail: "Editable on the variant update endpoint.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Editable on the variant update endpoint.",
      },
      {
        key: "isDeleted",
        label: "isDeleted",
        detail: "Editable on the variant update endpoint.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "combinationHash",
        label: "combinationHash",
        detail: "Generated by the variant service.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  physicalAttributes: {
    entityLabel: "Physical Attributes",
    createFields: [
      { key: "weight", label: "weight", detail: "Optional number, minimum 0." },
      { key: "length", label: "length", detail: "Optional number, minimum 0." },
      { key: "width", label: "width", detail: "Optional number, minimum 0." },
      { key: "height", label: "height", detail: "Optional number, minimum 0." },
    ],
    updateFields: [
      {
        key: "weight",
        label: "weight",
        detail: "Managed through the physical attributes upsert endpoint.",
      },
      {
        key: "length",
        label: "length",
        detail: "Managed through the physical attributes upsert endpoint.",
      },
      {
        key: "width",
        label: "width",
        detail: "Managed through the physical attributes upsert endpoint.",
      },
      {
        key: "height",
        label: "height",
        detail: "Managed through the physical attributes upsert endpoint.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  groupFieldValues: {
    entityLabel: "Group Field Value",
    createFields: [
      {
        key: "fieldId",
        label: "fieldId",
        detail: "Required UUID for the target group field.",
      },
      { key: "valueText", label: "valueText", detail: "Optional string." },
      { key: "valueNumber", label: "valueNumber", detail: "Optional number." },
      {
        key: "valueBoolean",
        label: "valueBoolean",
        detail: "Optional boolean.",
      },
      {
        key: "valueOptionId",
        label: "valueOptionId",
        detail: "Optional UUID referencing a dropdown option.",
      },
      {
        key: "values",
        label: "values[]",
        detail:
          "Bulk upsert endpoint accepts an array of these value payloads.",
      },
    ],
    updateFields: [
      {
        key: "fieldId",
        label: "fieldId",
        detail: "Managed through single or bulk upsert endpoints.",
      },
      {
        key: "valueText",
        label: "valueText",
        detail: "Managed through single or bulk upsert endpoints.",
      },
      {
        key: "valueNumber",
        label: "valueNumber",
        detail: "Managed through single or bulk upsert endpoints.",
      },
      {
        key: "valueBoolean",
        label: "valueBoolean",
        detail: "Managed through single or bulk upsert endpoints.",
      },
      {
        key: "valueOptionId",
        label: "valueOptionId",
        detail: "Managed through single or bulk upsert endpoints.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Entity-managed active state.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  vendors: {
    entityLabel: "Product Vendor",
    createFields: [
      {
        key: "vendorName",
        label: "vendorName",
        detail: "Required string, maximum 150 characters.",
      },
      {
        key: "contactPerson",
        label: "contactPerson",
        detail: "Optional string, maximum 100 characters.",
      },
      { key: "contactEmail", label: "contactEmail", detail: "Optional email." },
      {
        key: "contactPhone",
        label: "contactPhone",
        detail: "Optional string, maximum 20 characters.",
      },
      {
        key: "gstin",
        label: "gstin",
        detail: "Optional string, maximum 15 characters.",
      },
      { key: "address", label: "address", detail: "Optional string." },
      { key: "isPrimary", label: "isPrimary", detail: "Optional boolean." },
      { key: "notes", label: "notes", detail: "Optional string." },
      { key: "isActive", label: "isActive", detail: "Optional boolean." },
    ],
    updateFields: [
      {
        key: "vendorName",
        label: "vendorName",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "contactPerson",
        label: "contactPerson",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "contactEmail",
        label: "contactEmail",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "contactPhone",
        label: "contactPhone",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "gstin",
        label: "gstin",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "address",
        label: "address",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "isPrimary",
        label: "isPrimary",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "notes",
        label: "notes",
        detail: "Managed through the vendor resource.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Managed through the vendor resource.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
  zones: {
    entityLabel: "Product Zone",
    createFields: [
      {
        key: "zoneName",
        label: "zoneName",
        detail: "Required string, maximum 100 characters.",
      },
      {
        key: "zoneCode",
        label: "zoneCode",
        detail: "Optional string, maximum 10 characters.",
      },
      { key: "description", label: "description", detail: "Optional string." },
      { key: "isActive", label: "isActive", detail: "Optional boolean." },
    ],
    updateFields: [
      {
        key: "zoneName",
        label: "zoneName",
        detail: "Managed through the zone resource.",
      },
      {
        key: "zoneCode",
        label: "zoneCode",
        detail: "Managed through the zone resource.",
      },
      {
        key: "description",
        label: "description",
        detail: "Managed through the zone resource.",
      },
      {
        key: "isActive",
        label: "isActive",
        detail: "Managed through the zone resource.",
      },
    ],
    systemFields: [
      { key: "id", label: "id", detail: "Generated after save." },
      {
        key: "productId",
        label: "productId",
        detail: "Assigned by the parent product endpoint.",
      },
      {
        key: "createdAt",
        label: "createdAt",
        detail: "Assigned automatically on create.",
      },
      {
        key: "updatedAt",
        label: "updatedAt",
        detail: "Assigned automatically on update.",
      },
    ],
  },
};

function withFallback(
  value: string | null | undefined,
  fallback: string,
): string {
  if (value === undefined || value === null || value.trim() === "")
    return fallback;
  return value;
}

export function getEntitySystemFieldOverrides(
  entity?: EntitySystemFieldSnapshot,
): BackendFieldOverrideMap {
  if (!entity) return {};

  return {
    ...(entity.id ? { id: entity.id } : {}),
    ...(entity.isActive !== undefined
      ? { isActive: entity.isActive ? "Active" : "Inactive" }
      : {}),
    ...(entity.createdAt
      ? { createdAt: withFallback(entity.createdAt, "Available after save.") }
      : {}),
    ...(entity.updatedAt
      ? { updatedAt: withFallback(entity.updatedAt, "Available after save.") }
      : {}),
  };
}
