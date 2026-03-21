import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductGroupsAndLotMatrixTables1742539200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. product_groups
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_groups (
        id SERIAL PRIMARY KEY,
        group_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    // 2. group_fields
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS group_fields (
        id SERIAL PRIMARY KEY,
        group_id INT NOT NULL REFERENCES product_groups(id) ON DELETE RESTRICT,
        field_name VARCHAR(100) NOT NULL,
        field_key VARCHAR(100) NOT NULL,
        field_type VARCHAR(30) NOT NULL,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        is_filterable BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        CONSTRAINT uq_group_field_key UNIQUE (group_id, field_key)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_group_fields_group_id ON group_fields(group_id)`);

    // 3. group_field_options
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS group_field_options (
        id SERIAL PRIMARY KEY,
        field_id INT NOT NULL REFERENCES group_fields(id) ON DELETE CASCADE,
        option_label VARCHAR(100) NOT NULL,
        option_value VARCHAR(100) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        CONSTRAINT uq_field_option_value UNIQUE (field_id, option_value)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_group_field_options_field_id ON group_field_options(field_id)`);

    // 4. product_group_field_values
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_group_field_values (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        field_id INT NOT NULL REFERENCES group_fields(id) ON DELETE RESTRICT,
        value_text TEXT,
        value_number DECIMAL(12,2),
        value_boolean BOOLEAN,
        value_option_id INT REFERENCES group_field_options(id) ON DELETE SET NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        CONSTRAINT uq_product_field_value UNIQUE (product_id, field_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pgfv_product_id ON product_group_field_values(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pgfv_field_id ON product_group_field_values(field_id)`);

    // 5. product_attributes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        attribute_name VARCHAR(50) NOT NULL,
        attribute_code VARCHAR(30) NOT NULL,
        display_order INT,
        is_required BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_product_attribute_code UNIQUE (product_id, attribute_code)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes(product_id)`);

    // 6. product_attribute_values
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_attribute_values (
        id SERIAL PRIMARY KEY,
        attribute_id INT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
        value_label VARCHAR(50) NOT NULL,
        value_code VARCHAR(30) NOT NULL,
        display_order INT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_attribute_value_code UNIQUE (attribute_id, value_code)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_attribute_values_attribute_id ON product_attribute_values(attribute_id)`);

    // 7. product_variants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        sku VARCHAR(30) NOT NULL UNIQUE,
        upc VARCHAR(30) UNIQUE,
        combination_hash VARCHAR(150) NOT NULL,
        cost_price DECIMAL(12,2),
        unit_price DECIMAL(12,2),
        sale_price DECIMAL(12,2),
        stock_quantity INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        CONSTRAINT uq_product_combination_hash UNIQUE (product_id, combination_hash)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id)`);

    // 8. product_variant_attributes (join table — composite PK)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variant_attributes (
        variant_id INT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        attribute_id INT NOT NULL REFERENCES product_attributes(id) ON DELETE RESTRICT,
        attribute_value_id INT NOT NULL REFERENCES product_attribute_values(id) ON DELETE RESTRICT,
        PRIMARY KEY (variant_id, attribute_id),
        CONSTRAINT uq_variant_attribute UNIQUE (variant_id, attribute_id)
      )
    `);

    // 9. product_variant_media
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variant_media (
        id SERIAL PRIMARY KEY,
        variant_id INT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        media_url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_variant_media_variant_id ON product_variant_media(variant_id)`);

    // 10. Add is_active to existing satellite tables if missing
    await queryRunner.query(`ALTER TABLE product_media ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    await queryRunner.query(`ALTER TABLE product_marketing_media ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    await queryRunner.query(`ALTER TABLE product_vendors ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    await queryRunner.query(`ALTER TABLE product_zones ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    await queryRunner.query(`ALTER TABLE product_physical_attributes ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove is_active columns added to existing tables
    await queryRunner.query(`ALTER TABLE product_physical_attributes DROP COLUMN IF EXISTS is_active`);
    await queryRunner.query(`ALTER TABLE product_zones DROP COLUMN IF EXISTS is_active`);
    await queryRunner.query(`ALTER TABLE product_vendors DROP COLUMN IF EXISTS is_active`);
    await queryRunner.query(`ALTER TABLE product_marketing_media DROP COLUMN IF EXISTS is_active`);
    await queryRunner.query(`ALTER TABLE product_media DROP COLUMN IF EXISTS is_active`);

    // Drop new tables in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS product_variant_media`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_variant_attributes`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_attribute_values`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_attributes`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_group_field_values`);
    await queryRunner.query(`DROP TABLE IF EXISTS group_field_options`);
    await queryRunner.query(`DROP TABLE IF EXISTS group_fields`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_groups`);
  }
}
