import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignSchemaWithBackendSource1774500000000
  implements MigrationInterface
{
  name = 'AlignSchemaWithBackendSource1774500000000';

  private quoteColumns(columns: string[]): string {
    return columns.map((column) => `"${column}"`).join(', ');
  }

  private async assertUnique(
    queryRunner: QueryRunner,
    indexName: string,
    table: string,
    columns: string[],
    predicate: string,
  ): Promise<void> {
    const selectColumns = this.quoteColumns(columns);
    const duplicate = await queryRunner.query(`
      SELECT ${selectColumns}, COUNT(*)::int AS duplicate_count
      FROM "${table}"
      WHERE ${predicate}
      GROUP BY ${selectColumns}
      HAVING COUNT(*) > 1
      LIMIT 1
    `);

    if (duplicate.length > 0) {
      throw new Error(
        `Cannot create unique index ${indexName}: duplicate active rows exist in ${table}.`,
      );
    }
  }

  private async recreatePartialUniqueIndex(
    queryRunner: QueryRunner,
    indexName: string,
    table: string,
    columns: string[],
    predicate: string,
  ): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "${indexName}"`);
    await this.assertUnique(queryRunner, indexName, table, columns, predicate);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "${indexName}"
      ON "${table}" (${this.quoteColumns(columns)})
      WHERE ${predicate}
    `);
  }

  private async createIndex(
    queryRunner: QueryRunner,
    indexName: string,
    table: string,
    columns: string[],
    predicate?: string,
  ): Promise<void> {
    const whereClause = predicate ? ` WHERE ${predicate}` : '';
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "${indexName}"
      ON "${table}" (${this.quoteColumns(columns)})${whereClause}
    `);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add source-of-truth business columns without dropping legacy columns.
    await queryRunner.query(`
      ALTER TABLE "departments"
      ADD COLUMN IF NOT EXISTS "department_name" varchar(100),
      ADD COLUMN IF NOT EXISTS "department_code" varchar(10),
      ADD COLUMN IF NOT EXISTS "description" text
    `);
    await queryRunner.query(`
      ALTER TABLE "product_categories"
      ADD COLUMN IF NOT EXISTS "category_name" varchar(100),
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "photo" varchar(255),
      ADD COLUMN IF NOT EXISTS "department_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "sub_categories"
      ADD COLUMN IF NOT EXISTS "sub_category_name" varchar(100),
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "photo" varchar(255),
      ADD COLUMN IF NOT EXISTS "display_order" int NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "product_groups"
      ADD COLUMN IF NOT EXISTS "group_name" varchar(100),
      ADD COLUMN IF NOT EXISTS "description" text
    `);
    await queryRunner.query(`
      ALTER TABLE "group_fields"
      ADD COLUMN IF NOT EXISTS "display_order" int NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "group_field_options"
      ADD COLUMN IF NOT EXISTS "display_order" int NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "product_code" varchar(10),
      ADD COLUMN IF NOT EXISTS "upc_code" varchar(20),
      ADD COLUMN IF NOT EXISTS "product_name" varchar(150),
      ADD COLUMN IF NOT EXISTS "model" varchar(100),
      ADD COLUMN IF NOT EXISTS "hsn_code" varchar(8),
      ADD COLUMN IF NOT EXISTS "unit_price" numeric(12,2),
      ADD COLUMN IF NOT EXISTS "non_taxable" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "non_stock_item" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "product_media"
      ADD COLUMN IF NOT EXISTS "media_url" varchar(500),
      ADD COLUMN IF NOT EXISTS "display_order" int NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "file_size" int,
      ADD COLUMN IF NOT EXISTS "file_name" varchar(255)
    `);
    await queryRunner.query(`
      ALTER TABLE "product_attributes"
      ADD COLUMN IF NOT EXISTS "product_id" uuid,
      ADD COLUMN IF NOT EXISTS "attribute_name" varchar(50),
      ADD COLUMN IF NOT EXISTS "attribute_code" varchar(30),
      ADD COLUMN IF NOT EXISTS "display_order" int,
      ADD COLUMN IF NOT EXISTS "is_required" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "product_attribute_values"
      ADD COLUMN IF NOT EXISTS "value_label" varchar(50),
      ADD COLUMN IF NOT EXISTS "value_code" varchar(30),
      ADD COLUMN IF NOT EXISTS "display_order" int
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variants"
      ADD COLUMN IF NOT EXISTS "upc" varchar(30),
      ADD COLUMN IF NOT EXISTS "cost_price" numeric(12,2),
      ADD COLUMN IF NOT EXISTS "unit_price" numeric(12,2),
      ADD COLUMN IF NOT EXISTS "sale_price" numeric(12,2)
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_media"
      ADD COLUMN IF NOT EXISTS "media_url" varchar(500),
      ADD COLUMN IF NOT EXISTS "display_order" int,
      ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "username" varchar(255),
      ADD COLUMN IF NOT EXISTS "firstName" varchar(100),
      ADD COLUMN IF NOT EXISTS "middleName" varchar(100),
      ADD COLUMN IF NOT EXISTS "lastName" varchar(100),
      ADD COLUMN IF NOT EXISTS "password_hash" varchar(255),
      ADD COLUMN IF NOT EXISTS "is_temp_password" boolean NOT NULL DEFAULT true
    `);

    // 2. Relax legacy NOT NULL columns that would otherwise block new writes.
    await queryRunner.query(
      `ALTER TABLE "departments" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_groups" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_media" ALTER COLUMN "url" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attributes" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute_values" ALTER COLUMN "value" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_media" ALTER COLUMN "url" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );

    // 3. Backfill new columns from legacy Nest bootstrap columns.
    await queryRunner.query(`
      UPDATE "departments"
      SET "department_name" = COALESCE("department_name", "name")
    `);
    await queryRunner.query(`
      UPDATE "product_categories"
      SET "category_name" = COALESCE("category_name", "name")
    `);
    await queryRunner.query(`
      UPDATE "sub_categories"
      SET "sub_category_name" = COALESCE("sub_category_name", "name")
    `);
    await queryRunner.query(`
      UPDATE "product_groups"
      SET "group_name" = COALESCE("group_name", "name")
    `);
    await queryRunner.query(`
      UPDATE "group_fields"
      SET "display_order" = COALESCE("display_order", "sort_order", 0)
    `);
    await queryRunner.query(`
      UPDATE "group_field_options"
      SET "display_order" = COALESCE("display_order", "sort_order", 0)
    `);
    await queryRunner.query(`
      UPDATE "products"
      SET
        "product_code" = COALESCE("product_code", "sku"),
        "product_name" = COALESCE("product_name", "name"),
        "unit_price" = COALESCE("unit_price", "base_price")
    `);
    await queryRunner.query(`
      UPDATE "product_media"
      SET
        "media_url" = COALESCE("media_url", "url"),
        "display_order" = COALESCE("display_order", "sort_order", 0)
    `);
    await queryRunner.query(`
      UPDATE "product_attributes"
      SET
        "attribute_name" = COALESCE("attribute_name", "name"),
        "attribute_code" = COALESCE(
          "attribute_code",
          NULLIF(
            trim(
              both '_' from regexp_replace(
                lower(COALESCE("attribute_name", "name")),
                '[^a-z0-9]+',
                '_',
                'g'
              )
            ),
            ''
          )
        )
    `);
    await queryRunner.query(`
      UPDATE "product_attribute_values"
      SET
        "value_label" = COALESCE("value_label", "value"),
        "value_code" = COALESCE(
          "value_code",
          NULLIF(
            trim(
              both '_' from regexp_replace(
                lower(COALESCE("value_label", "value")),
                '[^a-z0-9]+',
                '_',
                'g'
              )
            ),
            ''
          )
        ),
        "display_order" = COALESCE("display_order", "sort_order")
    `);
    await queryRunner.query(`
      UPDATE "product_variants"
      SET "unit_price" = COALESCE("unit_price", "price")
    `);
    await queryRunner.query(`
      UPDATE "product_variant_media"
      SET "media_url" = COALESCE("media_url", "url")
    `);
    await queryRunner.query(`
      UPDATE "users"
      SET
        "username" = COALESCE("username", "email"),
        "firstName" = COALESCE("firstName", "first_name"),
        "middleName" = COALESCE("middleName", "middle_name"),
        "lastName" = COALESCE("lastName", "last_name"),
        "password_hash" = COALESCE("password_hash", "password"),
        "is_temp_password" = COALESCE("is_temp_password", false)
    `);

    // 4. Convert physical attribute storage to source-compatible varchar columns.
    await queryRunner.query(`
      ALTER TABLE "product_physical_attributes"
      ALTER COLUMN "weight" TYPE varchar(30)
      USING CASE WHEN "weight" IS NULL THEN NULL ELSE "weight"::varchar END
    `);
    await queryRunner.query(`
      ALTER TABLE "product_physical_attributes"
      ALTER COLUMN "length" TYPE varchar(30)
      USING CASE WHEN "length" IS NULL THEN NULL ELSE "length"::varchar END
    `);
    await queryRunner.query(`
      ALTER TABLE "product_physical_attributes"
      ALTER COLUMN "width" TYPE varchar(30)
      USING CASE WHEN "width" IS NULL THEN NULL ELSE "width"::varchar END
    `);
    await queryRunner.query(`
      ALTER TABLE "product_physical_attributes"
      ALTER COLUMN "height" TYPE varchar(30)
      USING CASE WHEN "height" IS NULL THEN NULL ELSE "height"::varchar END
    `);

    // 5. Enforce NOT NULL on new required source columns once they are backfilled.
    await queryRunner.query(
      `ALTER TABLE "departments" ALTER COLUMN "department_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ALTER COLUMN "category_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" ALTER COLUMN "sub_category_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_groups" ALTER COLUMN "group_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "product_code" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "product_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "unit_price" SET NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_attributes"
      ALTER COLUMN "attribute_name" SET NOT NULL,
      ALTER COLUMN "attribute_code" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "product_attribute_values"
      ALTER COLUMN "value_label" SET NOT NULL,
      ALTER COLUMN "value_code" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "product_media"
      ALTER COLUMN "media_url" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_media"
      ALTER COLUMN "media_url" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" SET NOT NULL,
      ALTER COLUMN "firstName" SET NOT NULL,
      ALTER COLUMN "lastName" SET NOT NULL,
      ALTER COLUMN "password_hash" SET NOT NULL
    `);

    // 6. Align foreign keys and uniqueness rules with the source business model.
    await queryRunner.query(
      `ALTER TABLE "group_fields" DROP CONSTRAINT IF EXISTS "FK_group_fields_group"`,
    );
    await queryRunner.query(`
      ALTER TABLE "group_fields"
      ADD CONSTRAINT "FK_group_fields_group"
      FOREIGN KEY ("group_id") REFERENCES "product_groups"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_department"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_sub_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_group"`,
    );
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_department"
      FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_sub_category"
      FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_group"
      FOREIGN KEY ("group_id") REFERENCES "product_groups"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(
      `ALTER TABLE "product_variant_attributes" DROP CONSTRAINT IF EXISTS "FK_product_variant_attributes_attribute"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_attributes" DROP CONSTRAINT IF EXISTS "FK_product_variant_attributes_value"`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_variant_attributes"
      ADD CONSTRAINT "FK_product_variant_attributes_attribute"
      FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variant_attributes"
      ADD CONSTRAINT "FK_product_variant_attributes_value"
      FOREIGN KEY ("attribute_value_id") REFERENCES "product_attribute_values"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "product_categories"
      DROP CONSTRAINT IF EXISTS "FK_product_categories_department"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_categories"
      ADD CONSTRAINT "FK_product_categories_department"
      FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(
      `ALTER TABLE "product_attributes" DROP CONSTRAINT IF EXISTS "FK_product_attributes_product"`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_attributes"
      ADD CONSTRAINT "FK_product_attributes_product"
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      DO $$
      DECLARE constraint_name text;
      BEGIN
        SELECT tc.constraint_name
        INTO constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'password_reset_tokens'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'user_id'
        LIMIT 1;

        IF constraint_name IS NOT NULL THEN
          EXECUTE format(
            'ALTER TABLE "password_reset_tokens" DROP CONSTRAINT %I',
            constraint_name
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "password_reset_tokens"
      ADD CONSTRAINT "FK_password_reset_tokens_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
    `);

    await queryRunner.query(`
      ALTER TABLE "product_group_field_values"
      DROP CONSTRAINT IF EXISTS "UQ_product_group_field_values_product_field"
    `);
    await queryRunner.query(`
      ALTER TABLE "product_variants"
      DROP CONSTRAINT IF EXISTS "UQ_product_variants_product_hash"
    `);

    // 7. Replace bootstrap indexes with source-aligned partial unique indexes.
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_user_roles_role_name_active',
      'user_roles',
      ['role_name'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_users_email_active',
      'users',
      ['email'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_users_username_active',
      'users',
      ['username'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_departments_department_name_active',
      'departments',
      ['department_name'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_departments_department_code_active',
      'departments',
      ['department_code'],
      `"deleted_at" IS NULL AND "is_active" = true AND "department_code" IS NOT NULL`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_categories_category_name_active',
      'product_categories',
      ['category_name'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_sub_categories_category_name_active',
      'sub_categories',
      ['category_id', 'sub_category_name'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_groups_group_name_active',
      'product_groups',
      ['group_name'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_group_fields_group_key_active',
      'group_fields',
      ['group_id', 'field_key'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_group_field_options_field_value_active',
      'group_field_options',
      ['field_id', 'option_value'],
      `"is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_products_product_code_active',
      'products',
      ['product_code'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_products_upc_code_active',
      'products',
      ['upc_code'],
      `"deleted_at" IS NULL AND "is_active" = true AND "upc_code" IS NOT NULL`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_products_product_name_active',
      'products',
      ['product_name'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_media_product_display_order',
      'product_media',
      ['product_id', 'display_order'],
      `TRUE`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_zones_product_zone_code',
      'product_zones',
      ['product_id', 'zone_code'],
      `"is_active" = true AND "zone_code" IS NOT NULL`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_group_field_values_product_field_active',
      'product_group_field_values',
      ['product_id', 'field_id'],
      `"is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_attributes_product_code_active',
      'product_attributes',
      ['product_id', 'attribute_code'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_attribute_values_attribute_code_active',
      'product_attribute_values',
      ['attribute_id', 'value_code'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_variants_product_hash_active',
      'product_variants',
      ['product_id', 'combination_hash'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_variants_sku_active',
      'product_variants',
      ['sku'],
      `"deleted_at" IS NULL AND "is_active" = true`,
    );
    await this.recreatePartialUniqueIndex(
      queryRunner,
      'UQ_product_variants_upc_active',
      'product_variants',
      ['upc'],
      `"deleted_at" IS NULL AND "is_active" = true AND "upc" IS NOT NULL`,
    );

    // 8. Source-style supporting indexes for performance and lookup integrity.
    await this.createIndex(
      queryRunner,
      'IDX_departments_is_active',
      'departments',
      ['is_active'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_categories_department_id',
      'product_categories',
      ['department_id'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_categories_is_active',
      'product_categories',
      ['is_active'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_sub_categories_category_active_order',
      'sub_categories',
      ['category_id', 'is_active', 'display_order'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_sub_categories_display_order',
      'sub_categories',
      ['display_order'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_products_department_sub_category',
      'products',
      ['department_id', 'sub_category_id'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_products_active_items',
      'products',
      ['is_active', 'item_inactive'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_products_sub_category_active',
      'products',
      ['sub_category_id', 'is_active'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_products_created_at',
      'products',
      ['created_at'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_products_model',
      'products',
      ['model'],
      `"model" IS NOT NULL`,
    );
    await this.createIndex(
      queryRunner,
      'IDX_products_hsn_code',
      'products',
      ['hsn_code'],
      `"hsn_code" IS NOT NULL`,
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_media_product_is_primary',
      'product_media',
      ['product_id', 'is_primary'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_zones_product_active',
      'product_zones',
      ['product_id', 'is_active'],
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_zones_zone_code',
      'product_zones',
      ['zone_code'],
      `"zone_code" IS NOT NULL`,
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_vendors_gstin',
      'product_vendors',
      ['gstin'],
      `"gstin" IS NOT NULL`,
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_attributes_product_id',
      'product_attributes',
      ['product_id'],
      `"product_id" IS NOT NULL`,
    );
    await this.createIndex(
      queryRunner,
      'IDX_product_variant_media_variant_id',
      'product_variant_media',
      ['variant_id'],
    );
  }

  public async down(): Promise<void> {
    throw new Error(
      'AlignSchemaWithBackendSource1774500000000 is intentionally irreversible because it backfills live business columns and relaxes legacy compatibility constraints.',
    );
  }
}
