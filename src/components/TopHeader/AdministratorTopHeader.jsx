import { Menu } from "@headlessui/react";
import { EditProfileDrawer } from "Components/EditProfileDrawer";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useState } from "react";
import { FaRegFlag, FaRegUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { IoIosArrowForward, IoIosLogOut } from "react-icons/io";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

const dropdownMenuItems = [
  { label: "Organization Details", link: "/administrator/org-detail" },
  { label: "Permission Console", link: "/administrator/permissions" },
  { label: "Application Settings", link: "/administrator/settings" },
];

const DropdownMenu = () => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger Button */}
      <Menu.Button>
        <HiOutlineCog6Tooth
          size={24}
          className="mt-2 cursor-pointer hover:text-gray-900"
        />
      </Menu.Button>

      {/* Dropdown Menu */}
      <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black text-accent ring-opacity-5 focus:outline-none z-10  p-3">
        <div className="py-1 space-y-2">
          {dropdownMenuItems?.map((item, i) => (
            <Menu.Item key={i} className="block">
              <Link
                to={item?.link}
                className="flex items-center gap-3  hover:text-primary justify-between"
              >
                <span>{item?.label}</span>
                <span>
                  <IoIosArrowForward />
                </span>
              </Link>
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default function AdministratorTopHeader() {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      dispatch({
        type: "LOGOUT",
      });

      navigate("/administrator/login");
      showToast(globalDispatch, "Logout successfully.");
    } catch (error) {
      console.log("logout error", error?.message);
    }
  };

  return (
    <div className="w-full font-body ">
      {/* Top Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-white">
        <div className="w-[10em] h-[50px] flex items-center">
          {state?.logo ? (
            <img src={state?.logo} alt="" className="w-28 h-10" />
          ) : null}
        </div>
        {/* Left Section */}
        <div className="flex flex-1 items-center gap-3">
          <span className="p-2 rounded-full bg-[#EEF1F4]">
            <FaRegFlag className="text-gray-500" size={20} />
          </span>
          <div>
            <p className="text-[10px] font-light uppercase text-gray-500">
              Administrator
            </p>
            <h5 className="text-lg font-medium text-gray-800">Swim for Life</h5>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6 text-gray-600">
          <button onClick={() => setIsProfileDrawerOpen(true)}>
            <FaRegUser
              size={18}
              className="cursor-pointer hover:text-gray-900"
            />
          </button>

          <DropdownMenu size={23} />

          {/* <HiOutlineCog6Tooth
            size={24}
            className="cursor-pointer hover:text-gray-900"
          /> */}

          <IoIosLogOut
            size={22}
            className="cursor-pointer hover:text-red-600"
            onClick={handleLogout}
          />
        </div>
      </div>

      <EditProfileDrawer
        open={isProfileDrawerOpen}
        setOpen={setIsProfileDrawerOpen}
      />
    </div>
  );
}
