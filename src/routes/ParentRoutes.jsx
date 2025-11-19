import React, { memo, useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "Context/Auth";
import metadataJSON from "Utils/metadata.json";
import { capitalizeString } from "Utils/utils";
import { ParentAuthPages, ParentListPages } from "./LazyLoad";

const AdminRoute = ({ path, children }) => {
  const Auth = useContext(AuthContext);

  const { isAuthenticated, role } = Auth?.state;
  React.useEffect(() => {
    const metadata = metadataJSON[path ?? "/"];
    if (metadata !== undefined) {
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
        <Navigate to="/parent/login" replace />
      )}
    </>
  );
};

export default memo(AdminRoute);

export const ParentAllRoutes = {
  publicRoutes: [
    { route: "login", page: ParentAuthPages.ParentLoginPage },
    { route: "forgot", page: ParentAuthPages.ParentForgotPage },
  ],
  privateRoutes: [
    {
      route: "dashboard",
      page: ParentListPages.ParentDashboard,
    },
  ],
};
