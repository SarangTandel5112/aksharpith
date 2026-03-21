import { ProductService } from './product.service';
import { BaseController } from '@common/base.controller';

/**
 * Product Controller
 * Extends BaseController to inherit common controller patterns
 * Reduces code duplication by using generic handlers
 */
export class ProductController extends BaseController {
  constructor(private productService: ProductService) {
    super();
  }

  getAllProducts = this.handleGetAll(
    (query) => this.productService.getAllProducts(query),
    'Products retrieved successfully'
  );

  getProductById = this.handleGetById(
    (id) => this.productService.getProductById(id),
    'Product retrieved successfully'
  );

  createProduct = this.handleCreate(
    (data) => this.productService.createProduct(data),
    'Product created successfully'
  );

  updateProduct = this.handleUpdate(
    (id, data) => this.productService.updateProduct(id, data),
    'Product updated successfully'
  );

  deleteProduct = this.handleDelete(
    (id) => this.productService.deleteProduct(id),
    'Product deleted successfully'
  );

  getProductCount = this.handleGetCount(
    () => this.productService.getProductCount(),
    'Product count retrieved successfully'
  );

  // ---- Media ----

  getMedia = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.getProductMedia(productId);
    },
    { successMessage: 'Product media retrieved successfully' }
  );

  addMedia = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.addProductMedia(productId, req.body);
    },
    { successMessage: 'Media added successfully', successStatus: 201 }
  );

  deleteMedia = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      const mediaId = this.validateId(req, res, 'mediaId');
      if (mediaId === null) throw new Error('Invalid mediaId');
      await this.productService.deleteProductMedia(productId, mediaId);
      return null;
    },
    { successMessage: 'Media deleted successfully' }
  );

  // ---- Marketing Media ----

  getMarketingMedia = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.getProductMarketingMedia(productId);
    },
    { successMessage: 'Product marketing media retrieved successfully' }
  );

  addMarketingMedia = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.addProductMarketingMedia(productId, req.body);
    },
    { successMessage: 'Marketing media added successfully', successStatus: 201 }
  );

  deleteMarketingMedia = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      const mediaId = this.validateId(req, res, 'mediaId');
      if (mediaId === null) throw new Error('Invalid mediaId');
      await this.productService.deleteProductMarketingMedia(productId, mediaId);
      return null;
    },
    { successMessage: 'Marketing media deleted successfully' }
  );

  // ---- Physical Attributes ----

  getPhysicalAttributes = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.getProductPhysicalAttributes(productId);
    },
    { successMessage: 'Physical attributes retrieved successfully' }
  );

  upsertPhysicalAttributes = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.upsertProductPhysicalAttributes(productId, req.body);
    },
    { successMessage: 'Physical attributes updated successfully' }
  );

  // ---- Zones ----

  getZones = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.getProductZones(productId);
    },
    { successMessage: 'Product zones retrieved successfully' }
  );

  upsertZones = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.upsertProductZones(productId, req.body);
    },
    { successMessage: 'Product zones updated successfully' }
  );

  // ---- Vendors ----

  getVendors = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.getProductVendors(productId);
    },
    { successMessage: 'Product vendors retrieved successfully' }
  );

  addVendor = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.addProductVendor(productId, req.body);
    },
    { successMessage: 'Vendor added successfully', successStatus: 201 }
  );

  deleteVendor = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      const vendorId = this.validateId(req, res, 'vendorId');
      if (vendorId === null) throw new Error('Invalid vendorId');
      await this.productService.deleteProductVendor(productId, vendorId);
      return null;
    },
    { successMessage: 'Vendor deleted successfully' }
  );

  // ---- Group Field Values ----

  getGroupFieldValues = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.getGroupFieldValues(productId);
    },
    { successMessage: 'Group field values retrieved successfully' }
  );

  upsertGroupFieldValues = this.asyncHandler(
    async (req, res) => {
      const productId = this.validateId(req, res, 'productId');
      if (productId === null) throw new Error('Invalid productId');
      return this.productService.upsertGroupFieldValues(productId, req.body);
    },
    { successMessage: 'Group field values updated successfully' }
  );
}
