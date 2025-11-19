import React, { memo, useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "Context/Auth";
import metadataJSON from "Utils/metadata.json";
import { capitalizeString } from "Utils/utils";
import {
  SuperAdminAddPages,
  SuperAdminAuthPages,
  SuperAdminCustomPages,
  SuperAdminEditPages,
  SuperAdminListPages,
  SuperAdminViewPages,
} from "./LazyLoad";

const SuperAdminRoute = ({ path, children }) => {
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
        <Navigate to="/super-admin/login" replace />
      )}
    </>
  );
};

export default memo(SuperAdminRoute);

export const SuperAdminAllRoutes = {
  publicRoutes: [
    { route: "login", page: SuperAdminAuthPages.SuperAdminLoginPage },
  ],
  privateRoutes: [
    {
      route: "dashboard",
      page: SuperAdminCustomPages.SuperAdminDashboard,
    },
    {
      route: "organization",
      page: SuperAdminListPages.SuperAdminListOrganizationPage,
    },
    {
      route: "add-organization",
      page: SuperAdminAddPages.SuperAdminAddOrganizationPage,
    },
    {
      route: "view-organization/:id",
      page: SuperAdminViewPages.SuperAdminViewOrganizationPage,
    },
    {
      route: "edit-organization-details/:id",
      page: SuperAdminEditPages.SuperAdminEditOrganizationPage,
    },
    {
      route: "edit-organization-admin/:id",
      page: SuperAdminEditPages.SuperAdminEditOrgAdminPage,
    },
    {
      route: "add-organization-admin/:organizationId",
      page: SuperAdminAddPages.SuperAdminAddOrganizationAdminPage,
    },
    {
      route: "global-admin",
      page: SuperAdminListPages.SuperAdminListGlobalAdmin,
    },
    {
      route: "add-global-admin",
      page: SuperAdminAddPages.SuperAdminAddGlobalAdminPage,
    },
    {
      route: "edit-global-admin/:id",
      page: SuperAdminEditPages.SuperAdminEditGlobalAdminPage,
    },
  ],
};
