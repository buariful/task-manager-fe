import React from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";
import { Logo, Logo2 } from "Assets/images";
import { LuLayoutDashboard, LuMapPin, LuVote } from "react-icons/lu";
import {
  MdLogout,
  MdOutlineBallot,
  MdOutlineMailOutline,
} from "react-icons/md";
import { FaStackExchange, FaUsers } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { FaVoteYea } from "react-icons/fa";
import { PiFlagBold, PiUserRectangle } from "react-icons/pi";
import { IoMdCheckboxOutline } from "react-icons/io";

export const AdminHeader = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { state } = React.useContext(GlobalContext);

  const menuItems = [
    {
      name: "Dashboard",
      key: "admin",
      path: "/admin/dashboard",
      icon: LuLayoutDashboard,
    },
    {
      name: "Users",
      key: "users",
      path: "/admin/users",
      icon: FaUsers,
    },
    {
      name: "Precinct",
      key: "precinct",
      path: "/admin/precinct",
      icon: LuMapPin,
    },
    {
      name: "Election",
      key: "election",
      path: "/admin/election",
      icon: LuVote,
    },
    {
      name: "Party",
      key: "party",
      path: "/admin/party",
      icon: PiFlagBold,
    },
    {
      name: "Races",
      key: "races",
      path: "/admin/race",
      icon: IoMdCheckboxOutline,
    },
    {
      name: "Candidates",
      key: "candidates",
      path: "/admin/candidate",
      icon: PiUserRectangle,
    },
    {
      name: "Request",
      key: "request",
      path: "/admin/request",
      icon: FaStackExchange,
    },
    {
      name: "Ballots Layout",
      key: "ballot",
      path: "/admin/ballots-layout",
      icon: MdOutlineBallot,
    },
    {
      name: "Email",
      key: "emails",
      path: "/admin/email",
      icon: MdOutlineMailOutline,
    },
    {
      name: "Profile",
      key: "profile",
      path: "/admin/profile",
      icon: CgProfile,
    },
    {
      name: "Logout",
      key: "logout",
      path: "/admin/login",
      icon: MdLogout,
      onClick: () =>
        dispatch({
          type: "LOGOUT",
        }),
    },
  ];

  return (
    <>
      <div className={`sidebar-holder ${!state.isOpen ? "open-nav" : ""}`}>
        <div className="sticky top-0 h-fit">
          <div className="grid h-[72px] w-full place-items-center bg-[#662D91]">
            <p
              style={{ fontFamily: "Inter,sans-serif" }}
              className="text-center text-lg font-[700] text-white"
            >
              Admin
            </p>
          </div>
          <img src={Logo2} alt="" className="mx-auto my-8 w-48" />

          <div className="sidebar-list w-full">
            <ul className="flex flex-wrap">
              {menuItems?.map((item, index) => (
                <li
                  key={index}
                  onClick={item.onClick}
                  className={`group flex w-full list-none items-center gap-2 pl-[2.5rem] hover:bg-gradient-to-tr hover:from-[#29ABE2] hover:to-[#61D0FF] hover:text-white md:pl-[4rem] ${
                    state.path === item.key
                      ? "bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] text-white"
                      : ""
                  }`}
                >
                  <item.icon
                    className={`text-2xl group-hover:text-white ${
                      state.path === item.key ? "text-white" : "text-[#29ABE2]"
                    }`}
                  />
                  <NavLink
                    to={item?.path}
                    className={`text-sm`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
