import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { ResponseHelper } from '@common/response.helper';

export class ProductController {
  constructor(private productService: ProductService) {}

  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.productService.getAllProducts(req.query);
      ResponseHelper.success(res, result, 'Products retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get products';
      ResponseHelper.error(res, message, 500);
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid product ID', 400);
        return;
      }

      const product = await this.productService.getProductById(id);
      ResponseHelper.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get product';
      const statusCode = message === 'Product not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  getProductsByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.categoryId, 10);
      if (isNaN(categoryId)) {
        ResponseHelper.error(res, 'Invalid category ID', 400);
        return;
      }

      const products = await this.productService.getProductsByCategory(
        categoryId
      );
      ResponseHelper.success(
        res,
        products,
        'Products retrieved successfully'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to get products by category';
      const statusCode = message === 'Category not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      ResponseHelper.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create product';
      ResponseHelper.error(res, message, 400);
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid product ID', 400);
        return;
      }

      const product = await this.productService.updateProduct(id, req.body);
      ResponseHelper.success(res, product, 'Product updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update product';
      const statusCode = message === 'Product not found' ? 404 : 400;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid product ID', 400);
        return;
      }

      await this.productService.deleteProduct(id);
      ResponseHelper.success(res, null, 'Product deleted successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete product';
      const statusCode = message === 'Product not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  getProductCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.productService.getProductCount();
      ResponseHelper.success(
        res,
        { count },
        'Product count retrieved successfully'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get product count';
      ResponseHelper.error(res, message, 500);
    }
  };

  getProductCountByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.categoryId, 10);
      if (isNaN(categoryId)) {
        ResponseHelper.error(res, 'Invalid category ID', 400);
        return;
      }

      const count = await this.productService.getProductCountByCategory(
        categoryId
      );
      ResponseHelper.success(
        res,
        { count },
        'Product count retrieved successfully'
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to get product count by category';
      const statusCode = message === 'Category not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };
}
