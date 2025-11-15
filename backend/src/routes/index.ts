import { Router } from 'express';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoryModule } from '@modules/category/category.module';
import { ProductModule } from '@modules/product/product.module';
import { RoleModule } from '@modules/role/role.module';

const router = Router();

// Initialize modules
const authModule = new AuthModule();
const userModule = new UserModule();
const categoryModule = new CategoryModule();
const productModule = new ProductModule();
const roleModule = new RoleModule();

// Register module routes
router.use('/auth', authModule.getRoutes());
router.use('/users', userModule.getRoutes());
router.use('/categories', categoryModule.getRoutes());
router.use('/products', productModule.getRoutes());
router.use('/roles', roleModule.getRoutes());

// Add more module routes here as needed
// Example:
// const catalogueModule = new CatalogueModule();
// router.use('/catalogue', catalogueModule.getRoutes());

export default router;
