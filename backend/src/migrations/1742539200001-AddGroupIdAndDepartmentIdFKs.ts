import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupIdAndDepartmentIdFKs1742539200001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed default ProductGroup if none exists
    await queryRunner.query(`
      INSERT INTO product_groups (group_name, is_active, created_at)
      VALUES ('General', true, NOW())
      ON CONFLICT (group_name) DO NOTHING
    `);

    // 2. Seed default Department if none exists
    await queryRunner.query(`
      INSERT INTO departments (department_name, is_active, created_at)
      VALUES ('General', true, NOW())
      ON CONFLICT (department_name) DO NOTHING
    `);

    // 3. Add group_id to products (nullable first, then backfill, then NOT NULL)
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS group_id int REFERENCES product_groups(id)`);
    await queryRunner.query(`UPDATE products SET group_id = (SELECT id FROM product_groups WHERE group_name = 'General' LIMIT 1) WHERE group_id IS NULL`);
    await queryRunner.query(`ALTER TABLE products ALTER COLUMN group_id SET NOT NULL`);

    // 4. Add department_id to product_categories (nullable first, then backfill, then NOT NULL)
    await queryRunner.query(`ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS department_id int REFERENCES departments(id)`);
    await queryRunner.query(`UPDATE product_categories SET department_id = (SELECT id FROM departments LIMIT 1) WHERE department_id IS NULL`);
    await queryRunner.query(`ALTER TABLE product_categories ALTER COLUMN department_id SET NOT NULL`);

    // 5. Remove GST columns from products
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_1_sgst`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_1_slab`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_2_cgst`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_2_slab`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_3_igst`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_3_slab`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_3_slab varchar(10)`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_3_igst boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_2_slab varchar(10)`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_2_cgst boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_1_slab varchar(10)`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_1_sgst boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE product_categories DROP COLUMN IF EXISTS department_id`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS group_id`);
  }
}
