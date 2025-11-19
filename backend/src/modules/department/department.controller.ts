import { BaseController } from '@common/base.controller';
import { DepartmentService } from './department.service';

export class DepartmentController extends BaseController {
  constructor(private departmentService: DepartmentService) {
    super();
  }

  getAllDepartments = this.handleGetAll(
    (query) => this.departmentService.getAllDepartments(query),
    'Departments retrieved successfully'
  );

  getDepartmentById = this.handleGetById((id) => this.departmentService.getDepartmentById(id), 'Department retrieved successfully');

  createDepartment = this.handleCreate((data) => this.departmentService.createDepartment(data), 'Department created successfully');

  updateDepartment = this.handleUpdate((id, data) => this.departmentService.updateDepartment(id, data), 'Department updated successfully');

  deleteDepartment = this.handleDelete((id) => this.departmentService.deleteDepartment(id), 'Department deleted successfully');

  getDepartmentCount = this.asyncHandler(async () => {
    const count = await this.departmentService.getDepartmentCount();
    return { count };
  }, { successMessage: 'Department count retrieved successfully' });
}
