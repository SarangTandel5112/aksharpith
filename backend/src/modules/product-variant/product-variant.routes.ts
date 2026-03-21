import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { ProductVariantController } from './product-variant.controller';

export function createProductVariantRoutes(controller: ProductVariantController): Router {
  const router = Router();

  router.get('/products/:productId/variants', authMiddleware, controller.getVariants);
  router.post('/products/:productId/variants/generate', authMiddleware, controller.generateVariants);
  router.post('/products/:productId/variants', authMiddleware, controller.createVariant);
  router.get('/variants/:id', authMiddleware, controller.getVariantById);
  router.put('/variants/:id', authMiddleware, controller.updateVariant);
  router.delete('/variants/:id', authMiddleware, controller.deleteVariant);

  return router;
}
