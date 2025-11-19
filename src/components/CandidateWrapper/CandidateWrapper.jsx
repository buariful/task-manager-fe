import React, { Suspense, memo } from "react";
import { useNavigate } from "react-router-dom";

import { CandidateHeader } from "Components/CandidateHeader";
import { TopHeader } from "Components/TopHeader";
import { Spinner } from "Assets/svgs";
import { Link } from "react-router-dom";
import { HomeIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { FiCheckSquare } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { GlobalContext } from "Context/Global";
import { AuthContext } from "Context/Auth";

const navigation = [];
const CandidateWrapper = ({ children }) => {
  const { state } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/candidate/login");
  };

  return (
    <div id="candidate_wrapper" className={`flex w-full max-w-full flex-col`}>
      <div className={`flex min-h-screen w-full max-w-full `}>
        {/* <CandidateHeader /> */}
        <div className={`mb-24 w-full overflow-hidden`}>
          {/* -------- menu bar ------- */}
          <div className=" bg-gradient-to-tr from-[#662D91] to-[#8C3EC7]">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
              <Link
                to={"/candidate/dashboard"}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#662D91]"
              >
                <FiCheckSquare className="text-md" />
              </Link>
              <h4 className="text-center text-lg font-semibold capitalize text-white">
                {state?.path === "home" ? "Home" : "Profile"}
              </h4>
              <button
                onClick={handleLogout}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#662D91] focus:outline-none"
                type="button"
              >
                <MdLogout className="text-md" />
              </button>
              {/* <Link
                to={"/candidate/profile"}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#662D91]"
              >
                <LuUser2 className="text-md" />
              </Link> */}
            </div>
          </div>

          <Suspense
            fallback={
              <div
                className={`flex h-screen w-full items-center justify-center`}
              >
                <Spinner size={100} color="#2CC9D5" />
              </div>
            }
          >
            <div className="w-full overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </Suspense>
        </div>

        {/* -------- bottom buttons -----*/}
        {/* <div className="fixed bottom-0 left-0 z-50 w-full"> */}
        <div className=" fixed bottom-0 left-0 z-50 w-full">
          <div className="grid grid-cols-2 border ">
            <Link
              to={"/candidate/dashboard"}
              className={` ${
                state.path === "home"
                  ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                  : "bg-white text-[#29ABE2]"
              }  py-3  text-center text-sm font-semibold shadow`}
            >
              Home
            </Link>
            <Link
              to={"/candidate/profile"}
              className={` ${
                state.path === "profile"
                  ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                  : "bg-white text-[#29ABE2]"
              }  py-3 text-center text-sm font-semibold shadow`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CandidateWrapper);
