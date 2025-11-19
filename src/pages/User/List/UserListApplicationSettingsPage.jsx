import {
  ApplicationSettings,
  SettingsSidebar,
  SkillCategoryList,
} from "Components/Administrator";
import { settingsSidebarValues } from "Components/Administrator/SettingsSidebar";
import {
  ApplicationSettingProvider,
  useuseApplicationSetting,
  useUserData,
} from "Context/Custom";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate, Navigate } from "react-router-dom";

export default function UserListApplicationSettingsPage() {
  const { permissions } = useUserData();
  const navigate = useNavigate();
  const handleBack = () => {
    permissions?.find;
    navigate(-1);
  };

  return (
    <div className="p-7">
      <ApplicationSettingProvider>
        {/* header */}

        <div className="flex items-center gap-1 ">
          <button onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h2>Application Settings</h2>
        </div>

        <div className={`flex  min-h-screen w-full max-w-full `}>
          <SettingsSidebar />
          <div className={` w-full overflow-hidden`}>
            <div className="w-full p-6 overflow-y-auto overflow-x-hidden">
              {/* <Permissions /> */}
              <ApplicationSettings />
            </div>
          </div>
        </div>
      </ApplicationSettingProvider>
    </div>
  );
}
