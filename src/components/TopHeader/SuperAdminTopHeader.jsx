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

export default function SuperAdminTopHeader() {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      dispatch({
        type: "LOGOUT",
      });

      navigate("/super-admin/login");
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
              Global Admin
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
