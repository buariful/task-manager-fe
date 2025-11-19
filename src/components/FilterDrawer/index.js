import { lazy } from "react";

export { default as FilterDrawer } from "./FilterDrawer";

export const FilterWithDate = lazy(() => import("./FilterWithDate"));
export const FilterWithDateRange = lazy(() => import("./FilterWithDateRange"));
