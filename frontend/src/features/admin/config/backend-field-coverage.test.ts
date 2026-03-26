import { describe, expect, it } from "vitest";
import { ADMIN_BACKEND_FIELD_COVERAGE } from "./backend-field-coverage";

describe("ADMIN_BACKEND_FIELD_COVERAGE", () => {
  it("defines coverage for every audited backend resource", () => {
    expect(Object.keys(ADMIN_BACKEND_FIELD_COVERAGE).sort()).toEqual(
      [
        "departments",
        "categories",
        "subCategories",
        "roles",
        "users",
        "attributes",
        "attributeValues",
        "groups",
        "groupFields",
        "groupFieldOptions",
        "products",
        "media",
        "marketingMedia",
        "variants",
        "physicalAttributes",
        "groupFieldValues",
        "vendors",
        "zones",
      ].sort(),
    );
  });

  it("keeps editable fields and system fields for each resource", () => {
    for (const coverage of Object.values(ADMIN_BACKEND_FIELD_COVERAGE)) {
      expect(coverage.createFields.length).toBeGreaterThan(0);
      expect(coverage.systemFields.length).toBeGreaterThan(0);
    }
  });
});
