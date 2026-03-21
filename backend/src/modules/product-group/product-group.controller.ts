import { BaseController } from '@common/base.controller';
import { ProductGroupService } from './product-group.service';

export class ProductGroupController extends BaseController {
  constructor(private service: ProductGroupService) {
    super();
  }

  getAll = this.handleGetAll(
    (query) => this.service.getAllGroups(query),
    'Product groups retrieved successfully'
  );

  getById = this.handleGetById(
    (id) => this.service.getGroupById(id),
    'Product group retrieved successfully'
  );

  create = this.handleCreate(
    (data) => this.service.createGroup(data),
    'Product group created successfully'
  );

  update = this.handleUpdate(
    (id, data) => this.service.updateGroup(id, data),
    'Product group updated successfully'
  );

  delete = this.handleDelete(
    (id) => this.service.deleteGroup(id),
    'Product group deleted successfully'
  );
}
