import { Repository } from 'typeorm';
import { ProductGroupFieldValue } from '@entities/product-group-field-value.entity';
import {
  IProductGroupFieldValueRepository,
  GroupFieldValueInput,
} from './interfaces/product-group-field-value.repository.interface';

export class ProductGroupFieldValueRepository implements IProductGroupFieldValueRepository {
  constructor(private repo: Repository<ProductGroupFieldValue>) {}

  async findByProductId(productId: number): Promise<ProductGroupFieldValue[]> {
    return this.repo.find({ where: { productId, isActive: true } });
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.repo.update({ productId }, { isActive: false });
  }

  async createMany(productId: number, values: GroupFieldValueInput[]): Promise<ProductGroupFieldValue[]> {
    const entities = values.map((v) =>
      this.repo.create({ productId, isActive: true, ...v })
    );
    return this.repo.save(entities);
  }
}
