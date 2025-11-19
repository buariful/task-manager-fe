import { lazy } from "react";

export const SettingsSidebar = lazy(() => import("./SettingsSidebar"));
export const SkillCategoryList = lazy(() => import("./SkillCategoryList"));
export const ApplicationSettings = lazy(() => import("./ApplicationSettings"));
export const EditNameStatusModal = lazy(() => import("./EditNameStatusModal"));
export const AddRecordWithNameModal = lazy(() =>
  import("./AddRecordWithNameModal")
);
export const OrganizationLables = lazy(() => import("./OrganizationLables"));
export const AddLocationModal = lazy(() => import("./AddLocationModal"));
export const EditLocationModal = lazy(() => import("./EditLocationModal"));
export const AddParticipantModal = lazy(() => import("./AddParticipantModal"));
export const EditParticipantModal = lazy(() =>
  import("./EditParticipantModal")
);
