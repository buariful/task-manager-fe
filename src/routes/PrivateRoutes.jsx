import React, { memo, useContext } from "react";
import { AuthContext } from "Context/Auth";
import { NotFound } from "./Routes";
import PublicRoute from "./PublicRoutes";
import AdministratorRoutes from "./AdministratorRoutes";
import UserRoutes from "./UserRoutes";
import ParentRoutes from "./ParentRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";

const PrivateRoute = ({ path, element, access }) => {
  const Auth = useContext(AuthContext);

  if (Auth?.state?.isAuthenticated) {
    switch (true) {
      case Auth?.state?.role === "public" && access === "public":
        return <PublicRoute path={path}>{element}</PublicRoute>;
      case Auth?.state?.role?.toLowerCase() === "administrator" &&
        access === "administrator":
        return <AdministratorRoutes path={path}>{element}</AdministratorRoutes>;
      case Auth?.state?.role?.toLowerCase() === "user" && access === "user":
        return <UserRoutes path={path}>{element}</UserRoutes>;
      case Auth?.state?.role?.toLowerCase() === "super-admin" &&
        access === "super-admin":
        return <SuperAdminRoutes path={path}>{element}</SuperAdminRoutes>;
      case Auth?.state?.role?.toLowerCase() === "parent" && access === "parent":
        return <ParentRoutes path={path}>{element}</ParentRoutes>;

      default:
        return <PublicRoute path={"*"} element={<NotFound />} />;
    }
  }
  if (!Auth?.state?.isAuthenticated) {
    return <PublicRoute path={"*"} element={<NotFound />} />;
  }
};

export default memo(PrivateRoute);
