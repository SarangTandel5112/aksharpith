import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { ProductAttributeController } from './product-attribute.controller';

export function createProductAttributeRoutes(controller: ProductAttributeController): Router {
  const router = Router();

  // Attribute routes nested under products
  router.get('/products/:productId/attributes', authMiddleware, controller.getAttributes);
  router.post('/products/:productId/attributes', authMiddleware, controller.createAttribute);

  // Attribute routes by attribute id
  router.get('/attributes/:id', authMiddleware, controller.getAttributeById);
  router.put('/attributes/:id', authMiddleware, controller.updateAttribute);
  router.delete('/attributes/:id', authMiddleware, controller.deleteAttribute);

  // Attribute value routes
  router.get('/attributes/:attributeId/values', authMiddleware, controller.getAttributeValues);
  router.post('/attributes/:attributeId/values', authMiddleware, controller.createAttributeValue);
  router.put('/attributes/values/:valueId', authMiddleware, controller.updateAttributeValue);
  router.delete('/attributes/values/:valueId', authMiddleware, controller.deleteAttributeValue);

  return router;
}
