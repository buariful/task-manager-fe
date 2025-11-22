import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";

const Navbar = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };
  console.log("location->>", location);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-600 border-b-2 border-blue-600"
      : "text-gray-600 hover:text-blue-500";
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                Task Manager
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive(
                  "/dashboard"
                )}`}
              >
                Dashboard
              </Link>
              <Link
                to="/teams"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive(
                  "/teams"
                )}`}
              >
                Teams
              </Link>

              <Link
                to="/projects"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive(
                  "/projects"
                )}`}
              >
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
