import React, { createContext, useContext, useState } from "react";

const initialState = {
  name: "",
};

const LevelContext = createContext(undefined);

const LevelProvider = ({ children }) => {
  const [levelData, setLevelData] = useState(initialState);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  return (
    <LevelContext.Provider
      value={{
        levelData,
        setLevelData,

        selectedSkills,
        setSelectedSkills,
        allSkills,
        setAllSkills,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
};

export default LevelProvider;
