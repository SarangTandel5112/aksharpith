import { Request, Response } from 'express';
import { BaseController } from '@common/base.controller';
import { ProductAttributeService } from './product-attribute.service';

export class ProductAttributeController extends BaseController {
  constructor(private service: ProductAttributeService) {
    super();
  }

  getAttributes = this.asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId, 10);
    const data = await this.service.getAttributesByProduct(productId);
    return data;
  }, { successMessage: 'Product attributes retrieved successfully' });

  getAttributeById = this.asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = await this.service.getAttributeById(id);
    return data;
  }, { successMessage: 'Product attribute retrieved successfully' });

  createAttribute = this.asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId, 10);
    const data = await this.service.createAttribute(productId, req.body);
    return data;
  }, { successMessage: 'Product attribute created successfully', successStatus: 201 });

  updateAttribute = this.asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = await this.service.updateAttribute(id, req.body);
    return data;
  }, { successMessage: 'Product attribute updated successfully' });

  deleteAttribute = this.asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await this.service.deleteAttribute(id);
    return null;
  }, { successMessage: 'Product attribute deleted successfully' });

  getAttributeValues = this.asyncHandler(async (req: Request, res: Response) => {
    const attributeId = parseInt(req.params.attributeId, 10);
    const data = await this.service.getAttributeValues(attributeId);
    return data;
  }, { successMessage: 'Attribute values retrieved successfully' });

  createAttributeValue = this.asyncHandler(async (req: Request, res: Response) => {
    const attributeId = parseInt(req.params.attributeId, 10);
    const data = await this.service.createAttributeValue(attributeId, req.body);
    return data;
  }, { successMessage: 'Attribute value created successfully', successStatus: 201 });

  updateAttributeValue = this.asyncHandler(async (req: Request, res: Response) => {
    const valueId = parseInt(req.params.valueId, 10);
    const data = await this.service.updateAttributeValue(valueId, req.body);
    return data;
  }, { successMessage: 'Attribute value updated successfully' });

  deleteAttributeValue = this.asyncHandler(async (req: Request, res: Response) => {
    const valueId = parseInt(req.params.valueId, 10);
    await this.service.deleteAttributeValue(valueId);
    return null;
  }, { successMessage: 'Attribute value deleted successfully' });
}
