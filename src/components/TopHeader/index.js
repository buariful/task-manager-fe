import { lazy } from "react";

export const TopHeader = lazy(() => import("./TopHeader"));
export const AdministratorTopHeader = lazy(() =>
  import("./AdministratorTopHeader")
);
export const SuperAdminTopHeader = lazy(() => import("./SuperAdminTopHeader"));
export const UserTopHeader = lazy(() => import("./UserTopHeader"));
export const ParentTopHeader = lazy(() => import("./ParentTopHeader"));
