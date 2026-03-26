export type BackendFieldDefinition = {
  key: string;
  label: string;
  detail: string;
};

export type BackendFieldCoverage = {
  entityLabel: string;
  createFields: BackendFieldDefinition[];
  updateFields?: BackendFieldDefinition[];
  systemFields: BackendFieldDefinition[];
  notes?: string[];
};

export type AdminBackendCoverageKey =
  | "departments"
  | "categories"
  | "subCategories"
  | "roles"
  | "users"
  | "attributes"
  | "attributeValues"
  | "groups"
  | "groupFields"
  | "groupFieldOptions"
  | "products"
  | "media"
  | "marketingMedia"
  | "variants"
  | "physicalAttributes"
  | "groupFieldValues"
  | "vendors"
  | "zones";

export type AdminBackendCoverageMap = Record<
  AdminBackendCoverageKey,
  BackendFieldCoverage
>;

export type BackendFieldOverrideMap = Partial<Record<string, string>>;

export type EntitySystemFieldSnapshot = {
  id?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};
