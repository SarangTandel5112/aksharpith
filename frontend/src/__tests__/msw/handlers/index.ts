import { adminHandlers } from "./admin.handlers";
import { authHandlers } from "./auth.handlers";
import { categoriesHandlers } from "./categories.handlers";
import { departmentsHandlers } from "./departments.handlers";
import { rolesHandlers } from "./roles.handlers";
import { usersHandlers } from "./users.handlers";

export { categoriesHandlers } from "./categories.handlers";

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...categoriesHandlers,
  ...departmentsHandlers,
  ...rolesHandlers,
  ...usersHandlers,
];
