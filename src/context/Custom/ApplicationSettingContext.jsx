import React, { createContext, useContext, useState } from "react";

export const ApplicationSettingContext = createContext();

const ApplicationSetting = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState("CATEGORY");
  return (
    <ApplicationSettingContext.Provider
      value={{
        selectedTab,
        setSelectedTab,
      }}
    >
      {children}
    </ApplicationSettingContext.Provider>
  );
};

// custom hook for easy use
export const useuseApplicationSetting = () => {
  return useContext(ApplicationSettingContext);
};

export default ApplicationSetting;
