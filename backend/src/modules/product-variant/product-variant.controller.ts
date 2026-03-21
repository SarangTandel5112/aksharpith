import { Request, Response } from 'express';
import { BaseController } from '@common/base.controller';
import { ProductVariantService } from './product-variant.service';

export class ProductVariantController extends BaseController {
  constructor(private service: ProductVariantService) {
    super();
  }

  getVariants = this.asyncHandler(async (req: Request, _res: Response) => {
    const productId = parseInt(req.params.productId, 10);
    return this.service.getVariantsByProduct(productId);
  }, { successMessage: 'Product variants retrieved successfully' });

  getVariantById = this.asyncHandler(async (req: Request, _res: Response) => {
    const id = parseInt(req.params.id, 10);
    return this.service.getVariantById(id);
  }, { successMessage: 'Product variant retrieved successfully' });

  generateVariants = this.asyncHandler(async (req: Request, _res: Response) => {
    const productId = parseInt(req.params.productId, 10);
    return this.service.generateVariants(productId);
  }, { successMessage: 'Product variants generated successfully', successStatus: 201 });

  createVariant = this.asyncHandler(async (req: Request, _res: Response) => {
    const productId = parseInt(req.params.productId, 10);
    return this.service.createVariant(productId, req.body);
  }, { successMessage: 'Product variant created successfully', successStatus: 201 });

  updateVariant = this.asyncHandler(async (req: Request, _res: Response) => {
    const id = parseInt(req.params.id, 10);
    return this.service.updateVariant(id, req.body);
  }, { successMessage: 'Product variant updated successfully' });

  deleteVariant = this.asyncHandler(async (req: Request, _res: Response) => {
    const id = parseInt(req.params.id, 10);
    await this.service.deleteVariant(id);
    return null;
  }, { successMessage: 'Product variant deleted successfully' });
}
