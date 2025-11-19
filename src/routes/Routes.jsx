import React, { useEffect, useContext, useState, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";

import PrivateRoute from "./PrivateRoutes";
import PublicRoute from "./PublicRoutes";
// import {PublicWrapper} from "Components/PublicWrapper";
import { NotFoundPage } from "Pages/404";
import { SnackBar } from "Components/SnackBar";
import { SessionExpiredModal } from "Components/SessionExpiredModal";

// generatePagesRoutes
import { PublicWrapper } from "Components/PublicWrapper";
import { AdminWrapper } from "Components/AdminWrapper";
import { OfficialWrapper } from "Components/OfficialWrapper";
import { CandidateWrapper } from "Components/CandidateWrapper";

import {
  HomePage,
  UserMagicLoginPage,
  MagicLoginVerifyPage,
  CustomAdminForgotPage,
  CustomAdminResetPage,
  CustomAdminDashboardPage,
  AdminAddUserTablePage,
  AdminEditUserTablePage,
  AdminViewUserTablePage,
  CustomAdminProfilePage,
  AdminSignUpPage,
  AdminDashboardPage,
  AdminUserListPage,
  AddAdminUserPage,
  AdministratorLoginPage,
  AdministratorResetPasswordPage,
} from "./LazyLoad";
import { Spinner } from "Assets/svgs";
import { SuspenseLoader } from "Components/SuspenseLoader";
import { SuspensLoader } from "Components/SuspensLoader";
import { AdministratorAllRoutes } from "./AdministratorRoutes";
import AdministratorWrapper from "Components/AdministratorWrapper/AdministratorWrapper";
import { UserAllRoutes } from "./UserRoutes";
import { UserWrapper } from "Components/User";
import { UserProvider } from "Context/Custom";
import { ParentAllRoutes } from "./ParentRoutes";
import ParentWrapper from "Components/ParentWrapper/ParentWrapper";
import { SuperAdminAllRoutes } from "./SuperAdminRoutes";
import { SuperAdminWrapper } from "Components/SuperAdminWrapper";

export const DynamicWrapper = ({ isAuthenticated, role, children }) => {
  if (!isAuthenticated) {
    return <PublicWrapper>{children}</PublicWrapper>;
  }
  if (isAuthenticated) {
    if (role === "public") {
      return <PublicWrapper>{children}</PublicWrapper>;
    }

    if (role === "admin") {
      return <AdminWrapper>{children}</AdminWrapper>;
    }

    if (role === "official") {
      return <OfficialWrapper>{children}</OfficialWrapper>;
    }

    if (role === "candidate") {
      return <CandidateWrapper>{children}</CandidateWrapper>;
    }
  }
};

export const NotFound = ({ isAuthenticated, role }) => {
  if (!isAuthenticated) {
    return (
      // <PublicWrapper>
      <NotFoundPage />
      // </PublicWrapper>
    );
  }
  if (isAuthenticated) {
    if (role === "public") {
      return (
        <PublicWrapper>
          <NotFoundPage />
        </PublicWrapper>
      );
    }

    if (role === "admin") {
      return (
        <AdminWrapper>
          <NotFoundPage />
        </AdminWrapper>
      );
    }

    if (role === "official") {
      return (
        <OfficialWrapper>
          <NotFoundPage />
        </OfficialWrapper>
      );
    }

    if (role === "candidate") {
      return (
        <CandidateWrapper>
          <NotFoundPage />
        </CandidateWrapper>
      );
    }
  }
};

export default () => {
  const { state } = useContext(AuthContext);
  const {
    state: { isOpen },
    dispatch,
  } = useContext(GlobalContext);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  function setDimension(e) {
    if (e.currentTarget.innerWidth >= 1024) {
      toggleSideBar(true);
    } else toggleSideBar(false);
    setScreenSize(e.currentTarget.innerWidth);
  }

  // const toTop = () => {
  //   containerRef.current.scrollTo(0, 0);
  // };

  const toggleSideBar = (open) => {
    if (isOpen && screenSize < 1024) {
      dispatch({
        type: "OPEN_SIDEBAR",
        payload: { isOpen: open },
      });
    } else if (!isOpen && screenSize >= 1024) {
      dispatch({
        type: "OPEN_SIDEBAR",
        payload: { isOpen: open },
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", setDimension);

    return () => {
      window.removeEventListener("resize", setDimension);
    };
  }, [screenSize]);

  return (
    <div
      onClick={() => {
        isOpen ? toggleSideBar(false) : null;
      }}
      className={`h-screen overflow-x-hidden bg-[#F9FAFB]`}
    >
      {" "}
      <Suspense
        fallback={
          <div className={`flex h-screen w-full items-center justify-center`}>
            <Spinner size={100} color="#2CC9D5" />
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute
                path={"/"}
                element={
                  <SuspensLoader>
                    <HomePage />
                  </SuspensLoader>
                }
              ></PublicRoute>
            }
          />

          <Route
            exact
            path={`/reset-password`}
            element={
              <PublicRoute
                path={`/reset-password`}
                element={
                  <SuspenseLoader>
                    <AdministratorResetPasswordPage />
                  </SuspenseLoader>
                }
              />
            }
          />
          {/* Administrator routes */}
          {AdministratorAllRoutes?.publicRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/administrator/${route.route}`}
              element={
                <PublicRoute
                  path={`/administrator/${route.route}`}
                  element={
                    <SuspenseLoader>
                      <route.page />
                    </SuspenseLoader>
                  }
                />
              }
            />
          ))}
          {AdministratorAllRoutes?.privateRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/administrator/${route.route}`}
              element={
                <PrivateRoute
                  access="administrator"
                  path={`/administrator/${route.route}`}
                  element={
                    <AdministratorWrapper>
                      <route.page />
                    </AdministratorWrapper>
                  }
                />
              }
            />
          ))}

          {/* User routes */}
          {UserAllRoutes?.publicRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/user/${route.route}`}
              element={
                <PublicRoute
                  path={`/user/${route.route}`}
                  element={
                    <SuspenseLoader>
                      <route.page />
                    </SuspenseLoader>
                  }
                />
              }
            />
          ))}

          {UserAllRoutes?.privateRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/user/${route.route}`}
              element={
                <PrivateRoute
                  access="user"
                  path={`/user/${route.route}`}
                  element={
                    <UserProvider>
                      <UserWrapper>
                        <route.page />
                      </UserWrapper>
                    </UserProvider>
                  }
                />
              }
            />
          ))}

          {/* Parent routes */}
          {ParentAllRoutes?.publicRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/parent/${route.route}`}
              element={
                <PublicRoute
                  path={`/parent/${route.route}`}
                  element={
                    <SuspenseLoader>
                      <route.page />
                    </SuspenseLoader>
                  }
                />
              }
            />
          ))}

          {ParentAllRoutes?.privateRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/parent/${route.route}`}
              element={
                <PrivateRoute
                  access="parent"
                  path={`/parent/${route.route}`}
                  element={
                    <ParentWrapper>
                      <route.page />
                    </ParentWrapper>
                  }
                />
              }
            />
          ))}

          {/* Super Admin Routes */}
          {SuperAdminAllRoutes?.publicRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/super-admin/${route.route}`}
              element={
                <PublicRoute
                  path={`/super-admin/${route.route}`}
                  element={
                    <SuspenseLoader>
                      <route.page />
                    </SuspenseLoader>
                  }
                />
              }
            />
          ))}

          {SuperAdminAllRoutes?.privateRoutes?.map((route, i) => (
            <Route
              key={i}
              exact
              path={`/super-admin/${route.route}`}
              element={
                <PrivateRoute
                  access="super-admin"
                  path={`/super-admin/${route.route}`}
                  element={
                    <SuperAdminWrapper>
                      <route.page />
                    </SuperAdminWrapper>
                  }
                />
              }
            />
          ))}

          <Route
            path={"*"}
            element={
              <PublicRoute
                path={"*"}
                element={
                  <SuspenseLoader>
                    <NotFound {...state} />
                  </SuspenseLoader>
                }
              />
            }
          />
        </Routes>
      </Suspense>
      <SessionExpiredModal />
      <SnackBar />
    </div>
  );
};
