import { adminHandlers } from "./admin.handlers";
import { authHandlers } from "./auth.handlers";
import { catalogHandlers } from "./catalog.handlers";
import { departmentsHandlers } from "./departments.handlers";
import { rolesHandlers } from "./roles.handlers";
import { usersHandlers } from "./users.handlers";

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...catalogHandlers,
  ...departmentsHandlers,
  ...rolesHandlers,
  ...usersHandlers,
];
