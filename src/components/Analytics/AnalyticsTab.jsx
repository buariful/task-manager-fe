import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";

const tabs = [
  { lable: "Total Report Cards", value: 1 },
  { lable: "Level", value: 2 },
  { lable: "Instructor", value: 3 },
  { lable: "Location", value: 4 },
  { lable: "Skills", value: 5 },
];

export default function AnalyticsTab({
  selectedTab,
  setSelectedTab,
  classsName = "",
}) {
  return (
    <div className={`flex items-center ${classsName}`}>
      {tabs?.map((tab) => (
        <InteractiveButton
          key={tab.value}
          className={`!text-base !border-none font-normal !px-10 ${
            selectedTab === tab.value
              ? "!bg-light-info !text-accent"
              : "!bg-[#f5f5f5] !text-accent"
          }`}
          onClick={() => setSelectedTab(tab.value)}
        >
          {tab.lable}
        </InteractiveButton>
      ))}
    </div>
  );
}
