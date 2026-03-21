import { Router } from 'express';
import { ProductController } from './product.controller';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dtos';

export const createProductRoutes = (
  productController: ProductController
): Router => {
  const router = Router();

  // Public routes (GET)
  router.get(
    '/',
    validationMiddleware(QueryProductDto),
    productController.getAllProducts
  );

  router.get('/stats/count', productController.getProductCount);

  router.get('/:id', productController.getProductById);

  // Protected routes (require authentication)
  router.post(
    '/',
    authMiddleware,
    validationMiddleware(CreateProductDto),
    productController.createProduct
  );

  router.put(
    '/:id',
    authMiddleware,
    validationMiddleware(UpdateProductDto),
    productController.updateProduct
  );

  router.delete('/:id', authMiddleware, productController.deleteProduct);

  return router;
};
