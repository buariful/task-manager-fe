import React, { useEffect, useContext, useState, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";

import PrivateRoute from "./PrivateRoutes";
import PublicRoute from "./PublicRoutes";
// import {PublicWrapper} from "Components/PublicWrapper";
import { NotFoundPage } from "Pages/404";
import { SnackBar } from "Components/SnackBar";

// generatePagesRoutes
import { PublicWrapper } from "Components/PublicWrapper";

// import {
//   HomePage,
// } from "./LazyLoad";
import { Spinner } from "Assets/svgs";
import { SuspenseLoader } from "Components/SuspenseLoader";
import { SuspensLoader } from "Components/SuspensLoader";
import { AdministratorAllRoutes } from "./AdministratorRoutes";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import TeamManagementPage from "../pages/TeamManagementPage";
import ProjectManagementPage from "../pages/ProjectManagementPage";
import RegisterPage from "../pages/RegisterPage";

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
  return (
    // <PublicWrapper>
    <NotFoundPage />
    // </PublicWrapper>
  );
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
            path="/login"
            element={
              <PublicRoute
                path={"/"}
                element={
                  <SuspensLoader>
                    <LoginPage />
                  </SuspensLoader>
                }
              ></PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute
                path={"/signup"}
                element={
                  <SuspensLoader>
                    <RegisterPage />
                  </SuspensLoader>
                }
              ></PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute
                path={"/"}
                element={
                  <SuspensLoader>
                    <RegisterPage />
                  </SuspensLoader>
                }
              ></PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              // <PublicRoute path="/dashboard">
              <DashboardPage />
              // </PublicRoute>
            }
          />
          <Route
            path="/teams"
            element={
              // <PrivateRoute path="/teams">
              <TeamManagementPage />
              // </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              // <PrivateRoute path="/projects">
              <ProjectManagementPage />
              // </PrivateRoute>
            }
          />

          <Route
            path="/"
            element={
              <PublicRoute
                path={"/"}
                element={
                  <SuspensLoader>
                    <p>Home</p>
                  </SuspensLoader>
                }
              ></PublicRoute>
            }
          />

          {/* Administrator routes */}
          {/* {AdministratorAllRoutes?.publicRoutes?.map((route, i) => (
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
          ))} */}

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
      <SnackBar />
    </div>
  );
};
