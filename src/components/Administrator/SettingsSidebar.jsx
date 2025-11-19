import { useuseApplicationSetting } from "Context/Custom";
import React from "react";

const sidebarItems = [
  { label: "Skill Categories", value: "CATEGORY" },
  { label: "Seasons", value: "SEASON" },
  { label: "Name Customizations", value: "NAME_CUSTOMIZATION" },
  { label: "Locations", value: "LOCATION" },
];

export const settingsSidebarValues = {
  category: "CATEGORY",
  season: "SEASON",
  name_customization: "NAME_CUSTOMIZATION",
  location: "LOCATION",
};

export default function SettingsSidebar() {
  const { selectedTab, setSelectedTab } = useuseApplicationSetting();
  return (
    <div className="w-[17rem] p-2 h-full min-h-80">
      <ul>
        {sidebarItems?.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => {
                setSelectedTab(item?.value);
              }}
              className={`w-full capitalize text-start p-2 rounded-2 ${
                item?.value === selectedTab ? "bg-light-info" : ""
              }`}
            >
              {item?.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
