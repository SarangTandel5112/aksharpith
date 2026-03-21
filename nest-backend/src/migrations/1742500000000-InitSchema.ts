import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1742500000000 implements MigrationInterface {
  name = 'InitSchema1742500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. user_roles
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "role_name" varchar(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_roles_role_name_active"
      ON "user_roles" ("role_name")
      WHERE "deleted_at" IS NULL
    `);

    // 2. users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" varchar(100) NOT NULL,
        "middle_name" varchar(100),
        "last_name" varchar(100) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "role_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_role" FOREIGN KEY ("role_id") REFERENCES "user_roles"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_email_active"
      ON "users" ("email")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role_id" ON "users" ("role_id")`,
    );

    // 3. password_reset_tokens
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token" varchar(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_password_reset_tokens_token" UNIQUE ("token"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")`,
    );

    // 4. departments
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_departments" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_departments_name_active"
      ON "departments" ("name")
      WHERE "deleted_at" IS NULL
    `);

    // 5. product_categories
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_product_categories_name_active"
      ON "product_categories" ("name")
      WHERE "deleted_at" IS NULL
    `);

    // 6. sub_categories
    await queryRunner.query(`
      CREATE TABLE "sub_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "category_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_sub_categories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sub_categories_category" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_sub_categories_name_category_active"
      ON "sub_categories" ("name", "category_id")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_categories_category_id" ON "sub_categories" ("category_id")`,
    );

    // 7. product_groups
    await queryRunner.query(`
      CREATE TABLE "product_groups" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_product_groups" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_product_groups_name_active"
      ON "product_groups" ("name")
      WHERE "deleted_at" IS NULL
    `);

    // 8. group_fields
    await queryRunner.query(`
      CREATE TABLE "group_fields" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "field_name" varchar(150) NOT NULL,
        "field_type" varchar(20) NOT NULL DEFAULT 'text',
        "field_key" varchar(100) NOT NULL DEFAULT '',
        "is_filterable" boolean NOT NULL DEFAULT false,
        "is_required" boolean NOT NULL DEFAULT false,
        "sort_order" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_group_fields" PRIMARY KEY ("id"),
        CONSTRAINT "FK_group_fields_group" FOREIGN KEY ("group_id") REFERENCES "product_groups"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_group_fields_group_id" ON "group_fields" ("group_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_group_fields_field_key" ON "group_fields" ("field_key")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_group_fields_group_key"
      ON "group_fields" ("group_id", "field_key")
      WHERE "deleted_at" IS NULL
    `);

    // 9. group_field_options
    await queryRunner.query(`
      CREATE TABLE "group_field_options" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "field_id" uuid NOT NULL,
        "option_label" varchar(100) NOT NULL DEFAULT '',
        "option_value" varchar(255) NOT NULL,
        "sort_order" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_group_field_options" PRIMARY KEY ("id"),
        CONSTRAINT "FK_group_field_options_field" FOREIGN KEY ("field_id") REFERENCES "group_fields"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_group_field_options_field_id" ON "group_field_options" ("field_id")`,
    );

    // 10. products
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "sku" varchar(100) NOT NULL,
        "description" text,
        "product_type" varchar(20) NOT NULL DEFAULT 'simple',
        "base_price" numeric(12,2) NOT NULL DEFAULT 0,
        "stock_quantity" int NOT NULL DEFAULT 0,
        "department_id" uuid,
        "sub_category_id" uuid,
        "group_id" uuid,
        "item_inactive" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_products_sub_category" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_products_group" FOREIGN KEY ("group_id") REFERENCES "product_groups"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_products_sku_active"
      ON "products" ("sku")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_products_department_id" ON "products" ("department_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_sub_category_id" ON "products" ("sub_category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_group_id" ON "products" ("group_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_product_type" ON "products" ("product_type")`,
    );

    // 11. product_media
    await queryRunner.query(`
      CREATE TABLE "product_media" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "url" varchar(500) NOT NULL,
        "media_type" varchar(20) NOT NULL DEFAULT 'image',
        "sort_order" int NOT NULL DEFAULT 0,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_media_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_media_product_id" ON "product_media" ("product_id")`,
    );

    // 12. product_marketing_media
    await queryRunner.query(`
      CREATE TABLE "product_marketing_media" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "media_url" varchar(500) NOT NULL,
        "media_type" varchar(20) NOT NULL DEFAULT 'photo',
        "display_order" int NOT NULL DEFAULT 0,
        "thumbnail_url" varchar(500),
        "duration" int,
        "file_size" int,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        CONSTRAINT "PK_product_marketing_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_marketing_media_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_marketing_media_product_id" ON "product_marketing_media" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_marketing_media_display_order" ON "product_marketing_media" ("product_id", "display_order")`,
    );

    // 13. product_physical_attributes
    await queryRunner.query(`
      CREATE TABLE "product_physical_attributes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "weight" numeric(10,3),
        "length" numeric(10,3),
        "width" numeric(10,3),
        "height" numeric(10,3),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_physical_attributes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_physical_attributes_product" UNIQUE ("product_id"),
        CONSTRAINT "FK_product_physical_attributes_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // 14. product_zones
    await queryRunner.query(`
      CREATE TABLE "product_zones" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "zone_name" varchar(100) NOT NULL,
        "zone_code" varchar(10),
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        CONSTRAINT "PK_product_zones" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_zones_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_zones_product_id" ON "product_zones" ("product_id")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_product_zones_product_zone_code"
      ON "product_zones" ("product_id", "zone_code")
      WHERE "zone_code" IS NOT NULL
    `);

    // 15. product_vendors
    await queryRunner.query(`
      CREATE TABLE "product_vendors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "vendor_name" varchar(150) NOT NULL,
        "contact_person" varchar(100),
        "contact_email" varchar(100),
        "contact_phone" varchar(20),
        "gstin" varchar(15),
        "address" text,
        "is_primary" boolean NOT NULL DEFAULT false,
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        CONSTRAINT "PK_product_vendors" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_vendors_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_vendors_product_id" ON "product_vendors" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_vendors_is_primary" ON "product_vendors" ("product_id", "is_primary")`,
    );

    // 16. product_group_field_values
    await queryRunner.query(`
      CREATE TABLE "product_group_field_values" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "field_id" uuid NOT NULL,
        "value_text" text,
        "value_number" numeric(12,2),
        "value_boolean" boolean,
        "value_option_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        CONSTRAINT "PK_product_group_field_values" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_group_field_values_product_field" UNIQUE ("product_id", "field_id"),
        CONSTRAINT "FK_product_group_field_values_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_group_field_values_field" FOREIGN KEY ("field_id") REFERENCES "group_fields"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_product_group_field_values_option" FOREIGN KEY ("value_option_id") REFERENCES "group_field_options"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_group_field_values_product_id" ON "product_group_field_values" ("product_id")`,
    );

    // 17. product_attributes
    await queryRunner.query(`
      CREATE TABLE "product_attributes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_product_attributes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_product_attributes_name_active"
      ON "product_attributes" ("name")
      WHERE "deleted_at" IS NULL
    `);

    // 18. product_attribute_values
    await queryRunner.query(`
      CREATE TABLE "product_attribute_values" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "attribute_id" uuid NOT NULL,
        "value" varchar(255) NOT NULL,
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_product_attribute_values" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_attribute_values_attribute" FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_product_attribute_values_attr_value_active"
      ON "product_attribute_values" ("attribute_id", "value")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_attribute_values_attribute_id" ON "product_attribute_values" ("attribute_id")`,
    );

    // 19. product_variants
    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "sku" varchar(100) NOT NULL,
        "price" numeric(12,2) NOT NULL DEFAULT 0,
        "stock_quantity" int NOT NULL DEFAULT 0,
        "combination_hash" varchar(500) NOT NULL,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_product_variants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_variants_product_hash" UNIQUE ("product_id", "combination_hash"),
        CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variants_product_id" ON "product_variants" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variants_combination_hash" ON "product_variants" ("combination_hash")`,
    );

    // 20. product_variant_attributes
    await queryRunner.query(`
      CREATE TABLE "product_variant_attributes" (
        "variant_id" uuid NOT NULL,
        "attribute_id" uuid NOT NULL,
        "attribute_value_id" uuid NOT NULL,
        CONSTRAINT "PK_product_variant_attributes" PRIMARY KEY ("variant_id", "attribute_id"),
        CONSTRAINT "FK_product_variant_attributes_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_variant_attributes_attribute" FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_product_variant_attributes_value" FOREIGN KEY ("attribute_value_id") REFERENCES "product_attribute_values"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_attributes_variant_id" ON "product_variant_attributes" ("variant_id")`,
    );

    // 21. product_variant_media
    await queryRunner.query(`
      CREATE TABLE "product_variant_media" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "variant_id" uuid NOT NULL,
        "url" varchar(500) NOT NULL,
        "media_type" varchar(20) NOT NULL DEFAULT 'image',
        "sort_order" int NOT NULL DEFAULT 0,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_variant_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_variant_media_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variant_media_variant_id" ON "product_variant_media" ("variant_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse FK order
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_variant_media" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_variant_attributes" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variants" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_attribute_values" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_attributes" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_group_field_values" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "product_vendors" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_zones" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_physical_attributes" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_marketing_media" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "product_media" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "group_field_options" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "group_fields" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_groups" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sub_categories" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "product_categories" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "password_reset_tokens" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE`);
  }
}
