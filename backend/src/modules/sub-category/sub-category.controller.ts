import { BaseController } from '@common/base.controller';
import { SubCategoryService } from './sub-category.service';

export class SubCategoryController extends BaseController {
  constructor(private subCategoryService: SubCategoryService) {
    super();
  }

  getAllSubCategories = this.handleGetAll(
    (query) => this.subCategoryService.getAllSubCategories(query),
    'Sub-categories retrieved successfully'
  );

  getSubCategoryById = this.handleGetById(
    (id) => this.subCategoryService.getSubCategoryById(id),
    'Sub-category retrieved successfully'
  );

  createSubCategory = this.handleCreate(
    (data) => this.subCategoryService.createSubCategory(data),
    'Sub-category created successfully'
  );

  updateSubCategory = this.handleUpdate(
    (id, data) => this.subCategoryService.updateSubCategory(id, data),
    'Sub-category updated successfully'
  );

  deleteSubCategory = this.handleDelete(
    (id) => this.subCategoryService.deleteSubCategory(id),
    'Sub-category deleted successfully'
  );
}
