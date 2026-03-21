import { Router } from 'express';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoryModule } from '@modules/category/category.module';
import { ProductModule } from '@modules/product/product.module';
import { RoleModule } from '@modules/role/role.module';
import { DepartmentModule } from '@modules/department/department.module';
import { SubCategoryModule } from '@modules/sub-category/sub-category.module';
import { ProductGroupModule } from '@modules/product-group/product-group.module';
import { ProductAttributeModule } from '@modules/product-attribute/product-attribute.module';
import { ProductVariantModule } from '@modules/product-variant/product-variant.module';

const router = Router();

// Initialize modules
const authModule = new AuthModule();
const userModule = new UserModule();
const categoryModule = new CategoryModule();
const subCategoryModule = new SubCategoryModule();
const departmentModule = new DepartmentModule();
const productModule = new ProductModule();
const roleModule = new RoleModule();
const productGroupModule = new ProductGroupModule();
const productAttributeModule = new ProductAttributeModule();
const productVariantModule = new ProductVariantModule();

// Register module routes
router.use('/auth', authModule.getRoutes());
router.use('/users', userModule.getRoutes());
router.use('/categories', categoryModule.getRoutes());
router.use('/sub-categories', subCategoryModule.getRoutes());
router.use('/departments', departmentModule.getRoutes());
router.use('/products', productModule.getRoutes());
router.use('/roles', roleModule.getRoutes());
router.use('/product-groups', productGroupModule.getRoutes());
router.use('/', productAttributeModule.getRoutes());
router.use('/', productVariantModule.getRoutes());

export default router;
