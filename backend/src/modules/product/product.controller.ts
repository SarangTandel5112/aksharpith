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

  getProductsByCategory = this.handleGetById(
    (categoryId) => this.productService.getProductsByCategory(categoryId),
    'Products retrieved successfully',
    'categoryId'
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

  getProductCountByCategory = this.handleGetById(
    (categoryId) => this.productService.getProductCountByCategory(categoryId).then(count => ({ count })),
    'Product count retrieved successfully',
    'categoryId'
  );
}
