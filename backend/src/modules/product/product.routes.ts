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

  // ---- Media sub-resource ----
  router.get('/:productId/media', authMiddleware, productController.getMedia);
  router.post('/:productId/media', authMiddleware, productController.addMedia);
  router.delete('/:productId/media/:mediaId', authMiddleware, productController.deleteMedia);

  // ---- Marketing Media sub-resource ----
  router.get('/:productId/marketing-media', authMiddleware, productController.getMarketingMedia);
  router.post('/:productId/marketing-media', authMiddleware, productController.addMarketingMedia);
  router.delete('/:productId/marketing-media/:mediaId', authMiddleware, productController.deleteMarketingMedia);

  // ---- Physical Attributes sub-resource ----
  router.get('/:productId/physical-attributes', authMiddleware, productController.getPhysicalAttributes);
  router.put('/:productId/physical-attributes', authMiddleware, productController.upsertPhysicalAttributes);

  // ---- Zones sub-resource ----
  router.get('/:productId/zones', authMiddleware, productController.getZones);
  router.put('/:productId/zones', authMiddleware, productController.upsertZones);

  // ---- Vendors sub-resource ----
  router.get('/:productId/vendors', authMiddleware, productController.getVendors);
  router.post('/:productId/vendors', authMiddleware, productController.addVendor);
  router.delete('/:productId/vendors/:vendorId', authMiddleware, productController.deleteVendor);

  // ---- Group Field Values sub-resource (Task 20) ----
  router.get('/:productId/group-field-values', authMiddleware, productController.getGroupFieldValues);
  router.put('/:productId/group-field-values', authMiddleware, productController.upsertGroupFieldValues);

  return router;
};
