import React, { memo, useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "Context/Auth";
import metadataJSON from "Utils/metadata.json";
import { capitalizeString } from "Utils/utils";
import {
  UserAddPages,
  UserAuthPages,
  UserCustomPages,
  UserDashboardPage,
  UserEditPages,
  UserListPages,
  UserPasswordForgotPage,
  UserViewPages,
} from "./LazyLoad";

const UserRoute = ({ path, children }) => {
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
        <Navigate to="/user/login" replace />
      )}
    </>
  );
};

export default memo(UserRoute);

export const UserAllRoutes = {
  publicRoutes: [
    { route: "login", page: UserAuthPages.UserLoginPage },
    { route: "forgot", page: UserPasswordForgotPage },
    // { route: "reset-password", page: AdministratorResetPasswordPage },
  ],
  privateRoutes: [
    {
      route: "dashboard",
      page: UserDashboardPage,
    },
    {
      route: "analytic",
      page: UserCustomPages.UserAnalyticsPage,
    },
    {
      route: "level",
      page: UserListPages.UserListLevelPage,
    },
    {
      route: "add-level",
      page: UserAddPages.UserAddLevelPage,
    },
    {
      route: "view-level/:id",
      page: UserViewPages.UserViewLevelPage,
    },
    {
      route: "edit-level/:id",
      page: UserEditPages.UserEditLevelPage,
    },
    {
      route: "edit-level-skills/:id",
      page: UserEditPages.UserEditLevelSkillsPage,
    },
    {
      route: "edit-level-details/:id",
      page: UserEditPages.UserEditLevelDetailsPage,
    },
    {
      route: "skill",
      page: UserListPages.UserListSkillPage,
    },
    {
      route: "worksheet",
      page: UserListPages.UserListWorksheetPage,
    },
    {
      route: "add-worksheet",
      page: UserAddPages.UserAddWorksheetPage,
    },
    {
      route: "edit-worksheet/:id",
      page: UserEditPages.UserEditWorksheetPage,
    },
    {
      route: "edit-worksheet-details/:id",
      page: UserEditPages.UserEditWokrsheetDetailsPage,
    },
    {
      route: "report",
      page: UserListPages.UserListReportCardPage,
    },
    {
      route: "edit-report/:id",
      page: UserEditPages.UserEditReportCardPage,
    },
    {
      route: "add-template",
      page: UserAddPages.UserAddReportTemplatePage,
    },
    {
      route: "edit-template/:id",
      page: UserEditPages.UserEditReportCardTemplatePage,
    },
    {
      route: "participant",
      page: UserListPages.UserListParticipantPage,
    },
    {
      route: "user",
      page: UserListPages.UserListUserPage,
    },
    {
      route: "participant-reports/:id",
      page: UserListPages.UserListParticipantReport,
    },
    {
      route: "application-settings",
      page: UserListPages.UserListApplicationSettingsPage,
    },
  ],
};
