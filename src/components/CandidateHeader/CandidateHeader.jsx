
import React from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";
export const CandidateHeader = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);

  return (
    <>
      <div className={`sidebar-holder ${!state.isOpen ? "open-nav" : ""}`}>
        <div className="sticky top-0 h-fit">
          <div className="w-full p-4 bg-sky-500">
            <div className="text-white font-bold text-center text-2xl">
            Candidate
            </div>
          </div>
          <div className="w-full sidebar-list">
            <ul className="flex flex-wrap">
              <li className="list-none block w-full">
                <NavLink
                  to="/candidate/dashboard"
                  className={`${state.path == "candidate" ? "text-black bg-gray-200" : ""}`}
                >
                  Dashboard
                </NavLink>
              </li>

              
                    

              
              <li className="list-none block w-full">
                <NavLink
                  to="/candidate/profile"
                  className={`${state.path == "profile" ? "text-black bg-gray-200" : ""}`}
                >
                  Profile
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/candidate/login"
                  onClick={() =>
                    dispatch({
                      type: "LOGOUT",
                    })
                  }
                >
                  Logout
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateHeader;


