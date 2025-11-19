import { lazy } from "react";

export const ReportFilterDrawer = lazy(() => import("./ReportFilterDrawer"));
export const ReportTemplateCard = lazy(() => import("./ReportTemplateCard"));
export const EditReportPageHeader = lazy(() =>
  import("./EditReportPageHeader")
);

export const EditReportPageSideBar = lazy(() =>
  import("./EditReportPageSideBar")
);

export const EditRportParicipantResult = lazy(() =>
  import("./EditRportParicipantResult")
);

export const EditReportPageRightBar = lazy(() =>
  import("./EditReportPageRightBar")
);

export const ReportCardView = lazy(() => import("./ReportCardView"));

export const ReportCardViewModal = lazy(() =>
  import("./ReportCardViewModal").then((module) => ({
    default: module.ReportCardViewModal,
  }))
);

export const ReportWorksheetList = lazy(() => import("./ReportWorksheetList"));

export const ReportTemplateList = lazy(() => import("./ReportTemplateList"));
export const PublishedReportCardList = lazy(() =>
  import("./PublishedReportCardList")
);
