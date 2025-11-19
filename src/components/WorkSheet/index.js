import { lazy } from "react";

export const WorksheetAddHeader = lazy(() => import("./WorksheetAddHeader"));
export const WorksheetAddDetailForm = lazy(() =>
  import("./WorksheetAddDetailForm")
);
export const WorksheetParticipants = lazy(() =>
  import("./WorksheetParticipants")
);
export const WorksheetFilterDrawer = lazy(() =>
  import("./WorksheetFilterDrawer")
);
export const InstructorFilter = lazy(() => import("./InstructorFilter"));
export const LocationFilter = lazy(() => import("./LocationFilter"));
export const SeasonFilter = lazy(() => import("./SeasonFilter"));
export const FilterWIthWeeklyDays = lazy(() =>
  import("./FilterWIthWeeklyDays")
);
export const EditWorksheetPageHeader = lazy(() =>
  import("./EditWorksheetPageHeader")
);
export const BorderedCheckBox = lazy(() => import("./BorderedCheckBox"));
export const WorksheetDetailsDrawer = lazy(() =>
  import("./WorksheetDetailsDrawer")
);
export const ParticipantResult = lazy(() => import("./ParticipantResult"));
export const ToggleOneSkillButton = lazy(() =>
  import("./ToggleOneSkillButton")
);

export const Participant = lazy(() => import("./Participant"));
