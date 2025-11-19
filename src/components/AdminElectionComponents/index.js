import { lazy } from "react";

export const AdminElectionFilter = lazy(() => import("./AdminElectionFilter"));
export const AdminElectionTable = lazy(() => import("./AdminElectionTable"));
export const ElectionTypeSelect = lazy(() => import("./ElectionTypeSelect"));
export const ElectionTypeStateCountySelect = lazy(() =>
  import("./ElectionTypeStateCountySelect.jsx")
);
