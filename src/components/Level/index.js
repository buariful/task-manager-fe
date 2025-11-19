import { lazy } from "react";

export const AdministratorAddLevelForm = lazy(() =>
  import("./AdministratorAddLevelForm")
);
export const UserAddLevelForm = lazy(() => import("./UserAddLevelForm"));
export const SkillCategoryFilter = lazy(() => import("./SkillCategoryFilter"));
export const LevelFilterDrawer = lazy(() => import("./LevelFilterDrawer"));
export const EditLevelPageHeader = lazy(() => import("./EditLevelPageHeader"));
export const LevelDetailsSkillList = lazy(() =>
  import("./LevelDetailsSkillList")
);
export const LevelDetails = lazy(() => import("./LevelDetails"));
export const SelectFilteredLevels = lazy(() =>
  import("./SelectFilteredLevels")
);
export const EditLevelSkills = lazy(() => import("./EditLevelSkills"));
