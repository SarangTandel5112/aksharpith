import { adminHandlers } from "./admin.handlers";
import { authHandlers } from "./auth.handlers";
import { catalogHandlers } from "./catalog.handlers";
import { departmentsHandlers } from "./departments.handlers";

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...catalogHandlers,
  ...departmentsHandlers,
];
