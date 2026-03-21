# 08 — Controllers & Routes

## Controller: Thin HTTP Adapters

Controllers extend `BaseController` and use its helper methods. No business logic.

```typescript
export class DepartmentController extends BaseController {
  constructor(private service: DepartmentService) { super(); }

  getAll = this.handleGetAll(
    (query) => this.service.getAllDepartments(query),
    'Departments retrieved successfully'
  );

  getById = this.handleGetById(
    (id) => this.service.getDepartmentById(id),
    'Department retrieved successfully'
  );

  create = this.handleCreate(
    (data) => this.service.createDepartment(data),
    'Department created successfully'
  );

  update = this.handleUpdate(
    (id, data) => this.service.updateDepartment(id, data),
    'Department updated successfully'
  );

  delete = this.handleDelete(
    (id) => this.service.deleteDepartment(id),
    'Department deleted successfully'
  );
}
```

## Route File

```typescript
export function createDepartmentRoutes(controller: DepartmentController): Router {
  const router = Router();
  router.get('/', authMiddleware, controller.getAll);
  router.get('/:id', authMiddleware, controller.getById);
  router.post('/', authMiddleware, controller.create);
  router.put('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);
  return router;
}
```

## Route Naming

- `GET /resource` — list
- `GET /resource/:id` — get one
- `POST /resource` — create
- `PUT /resource/:id` — update
- `DELETE /resource/:id` — delete (soft)
- `GET /resource/:id/sub-resource` — nested resource list
- `POST /resource/:id/sub-resource/action` — specific action
