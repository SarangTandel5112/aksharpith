import { Product } from '@entities/product.entity';
import { PaginatedResult } from '@common/types';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dtos';

export interface IProductService {
  getAllProducts(query: QueryProductDto): Promise<PaginatedResult<Product>>;
  getProductById(id: number): Promise<Product>;
  createProduct(data: CreateProductDto): Promise<Product>;
  updateProduct(id: number, data: UpdateProductDto): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getProductCount(): Promise<number>;
}
