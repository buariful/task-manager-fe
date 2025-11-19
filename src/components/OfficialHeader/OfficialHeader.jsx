import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";
import { Logo, Logo2 } from "Assets/images";
import {
  LuMapPin,
  LuVote,
  LuUser,
  LuLogOut,
  LuLayoutDashboard,
} from "react-icons/lu";
import { AiOutlineAppstore } from "react-icons/ai";
import { FaRegFlag, FaStackExchange } from "react-icons/fa6";
import { IoMdCheckboxOutline } from "react-icons/io";
import { PiFlagBold, PiHandsPraying, PiUserRectangle } from "react-icons/pi";
import { MdLogout, MdOutlineBallot } from "react-icons/md";

export const OfficialHeader = () => {
  const { dispatch, state: authState } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);

  return (
    <>
      <div className={`sidebar-holder ${!state.isOpen ? "open-nav" : ""}`}>
        <div className="sticky top-0 h-fit">
          <div className="grid h-[72px] w-full place-items-center bg-[#662D91]">
            <p className="px-2 text-[16px] font-semibold text-[#F3F2F1] md:px-3 lg:px-0 lg:pl-2">
              {authState?.official_type === 1 &&
                "Election Preparation Database"}
              {authState?.official_type === 2 && "State Election Database"}
            </p>
          </div>
          <Link to={"/"}>
            <img src={Logo2} alt="" className="mx-auto my-8 h-auto w-48" />
          </Link>

          <div className="sidebar-list w-full">
            <ul className="flex flex-wrap">
              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "official"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <LuLayoutDashboard
                  className={`text-2xl group-hover:text-white ${
                    state.path == "official" ? "text-white" : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/dashboard"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Dashboard
                </NavLink>
              </li>

              {authState?.official_type !== 2 && (
                <li
                  className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                    state.path == "precincts"
                      ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                      : ""
                  }`}
                >
                  <LuMapPin
                    className={`text-2xl group-hover:text-white ${
                      state.path == "precincts"
                        ? "text-white"
                        : "text-[#29ABE2]"
                    } hover:text-white`}
                  />
                  <NavLink
                    to="/official/precincts"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    className={"text-sm"}
                  >
                    Precincts
                  </NavLink>
                </li>
              )}

              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "elections"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <LuVote
                  className={`text-2xl group-hover:text-white ${
                    state.path == "elections" ? "text-white" : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/elections"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Elections
                </NavLink>
              </li>

              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "parties"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <PiFlagBold
                  className={`text-2xl group-hover:text-white ${
                    state.path == "parties" ? "text-white" : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/parties"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Parties
                </NavLink>
              </li>

              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "races"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <IoMdCheckboxOutline
                  className={`text-2xl group-hover:text-white ${
                    state.path == "races" ? "text-white" : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/races"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Races
                </NavLink>
              </li>
              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "candidates"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <PiUserRectangle
                  className={`text-2xl group-hover:text-white ${
                    state.path == "candidates" ? "text-white" : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/candidates"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Candidates
                </NavLink>
              </li>
              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "modification"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <PiHandsPraying
                  className={`text-2xl group-hover:text-white ${
                    state.path == "modification"
                      ? "text-white"
                      : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/modification"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Modification
                </NavLink>
              </li>
              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  authState?.official_type == 2 ? "hidden" : ""
                } ${
                  state.path == "ballots_layout"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <MdOutlineBallot
                  className={`text-2xl group-hover:text-white ${
                    state.path == "ballots_layout"
                      ? "text-white"
                      : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/ballots_layout"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Ballots Layout
                </NavLink>
              </li>

              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                  state.path == "profile"
                    ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                    : ""
                }`}
              >
                <LuUser
                  className={`text-2xl group-hover:text-white ${
                    state.path == "profile" ? "text-white" : "text-[#29ABE2]"
                  } hover:text-white`}
                />
                <NavLink
                  to="/official/profile"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Profile
                </NavLink>
              </li>
              <li
                className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] `}
              >
                <MdLogout
                  className={`text-2xl text-[#29ABE2] hover:text-white group-hover:text-white`}
                />
                <NavLink
                  to="/official/login"
                  className={`text-sm`}
                  style={{ fontFamily: "Inter, sans-serif" }}
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

export default OfficialHeader;
