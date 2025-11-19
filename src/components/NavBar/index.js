import { lazy } from "react";

export const NavBar = lazy(() => import("./NavBar"));

export const AdministratorNavBar = lazy(() => import("./AdministratorNavBar"));

export const UserNavBar = lazy(() => import("./UserNavBar"));

export const SuperAdminNavBar = lazy(() => import("./SuperAdminNavBar"));
