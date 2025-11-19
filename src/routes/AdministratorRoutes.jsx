import React, { memo, useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "Context/Auth";
import metadataJSON from "Utils/metadata.json";
import { capitalizeString } from "Utils/utils";
import {
  AdministratorAddPages,
  AdministratorCustomPages,
  AdministratorEditPages,
  AdministratorLevelListPage,
  AdministratorListPages,
  AdministratorLoginPage,
  AdministratorPasswordForgotPage,
  AdministratorReportListPage,
  AdministratorResetPasswordPage,
  AdministratorSkillListPage,
  AdministratorWorksheetPage,
} from "./LazyLoad";

const AdminRoute = ({ path, children }) => {
  const Auth = useContext(AuthContext);

  const { isAuthenticated, role } = Auth?.state;
  React.useEffect(() => {
    const metadata = metadataJSON[path ?? "/"];
    if (metadata !== undefined) {
      // document.title = metadata?.title?metadata?.title:"staci_j";
      document.title = capitalizeString(metadata?.title)
        ? capitalizeString(metadata?.title)
        : "Neoteric";
    } else {
      document.title = "Neoteric";
    }
  }, [path]);

  return (
    <>
      {isAuthenticated ? (
        <>{children}</>
      ) : (
        <Navigate to="/administrator/login" replace />
      )}
    </>
  );
};

export default memo(AdminRoute);

export const AdministratorAllRoutes = {
  publicRoutes: [
    { route: "login", page: AdministratorLoginPage },
    { route: "forgot", page: AdministratorPasswordForgotPage },
    { route: "reset-password", page: AdministratorResetPasswordPage },
  ],
  privateRoutes: [
    {
      route: "dashboard",
      page: AdministratorCustomPages.AdministratorDashboardPage,
    },
    {
      route: "level",
      page: AdministratorLevelListPage,
    },
    {
      route: "skill",
      page: AdministratorSkillListPage,
    },
    {
      route: "report",
      page: AdministratorReportListPage,
    },
    {
      route: "edit-report/:id",
      page: AdministratorEditPages.AdministratorEditReportCardPage,
    },
    {
      route: "worksheet",
      page: AdministratorWorksheetPage,
    },
    {
      route: "add-worksheet",
      page: AdministratorAddPages.AdministratorAddWorksheetPage,
    },
    {
      route: "add-template",
      page: AdministratorAddPages.AdministratorAddReportTemplatePage,
    },
    {
      route: "edit-worksheet/:id",
      page: AdministratorEditPages.AdministratorEditWorksheetPage,
    },
    {
      route: "edit-worksheet-details/:id",
      page: AdministratorEditPages.AdministratorEditWorksheetDetailsPage,
    },
    {
      route: "edit-template/:id",
      page: AdministratorEditPages.AdministratorEditTemplatePage,
    },

    {
      route: "add-level",
      page: AdministratorAddPages.AdministratorAddLevelPage,
    },
    {
      route: "edit-level/:id",
      page: AdministratorEditPages.AdministratorEditLevelPage,
    },
    {
      route: "edit-level-details/:id",
      page: AdministratorEditPages.AdministratorEditLevelDetailsPage,
    },
    {
      route: "edit-level-skills/:id",
      page: AdministratorEditPages.AdministratorEditLevelSkillsPage,
    },
    {
      route: "participant",
      page: AdministratorListPages.AdministratorListParticipantPage,
    },
    {
      route: "participant-reports/:id",
      page: AdministratorListPages.AdministratorListParticipantReport,
    },
    {
      route: "user",
      page: AdministratorListPages.AdministratorUserListPage,
    },
    {
      route: "add-user",
      page: AdministratorAddPages.AdministratorAddUserPage,
    },
    {
      route: "org-detail",
      page: AdministratorCustomPages.AdministratorOrgDetailPage,
    },
    {
      route: "org-detail/edit",
      page: AdministratorEditPages.AdministratorEditOrgDetailPage,
    },
    {
      route: "permissions",
      page: AdministratorCustomPages.AdministratorPermissionPage,
    },
    {
      route: "settings",
      page: AdministratorCustomPages.AdministratorSettingPage,
    },
    {
      route: "analytic",
      page: AdministratorCustomPages.AdministratorAnalyticsPage,
    },
  ],
};
