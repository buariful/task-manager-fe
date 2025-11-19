import { lazy } from "react";

export const AddOrganizationHeader = lazy(() =>
  import("./AddOrganizationHeader")
);

export const AddOrganizationDetailsForm = lazy(() =>
  import("./AddOrganizationDetailsForm")
);

export const AdminCreateForm = lazy(() => import("./AdminCreateForm"));
export const OrganizationDetails = lazy(() => import("./OrganizationDetails"));
export const OrganizationAdmin = lazy(() => import("./OrganizationAdmin"));
