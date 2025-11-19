import { useuseApplicationSetting } from "Context/Custom";
import React from "react";
import { settingsSidebarValues } from "./SettingsSidebar";
import SkillCategoryList from "./SkillCategoryList";
import SeasonList from "./SeasonList";
import OrganizationLables from "./OrganizationLables";
import LocationList from "./LocationList";

export default function ApplicationSettings() {
  const { selectedTab, setSelectedTab } = useuseApplicationSetting();

  return (
    <div>
      {selectedTab === settingsSidebarValues?.season ? (
        <SeasonList />
      ) : selectedTab === settingsSidebarValues?.name_customization ? (
        <OrganizationLables />
      ) : selectedTab === settingsSidebarValues?.location ? (
        <LocationList />
      ) : (
        <SkillCategoryList />
      )}
    </div>
  );
}
