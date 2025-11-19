import React from "react";

import { GlobalContext } from "Context/Global";
import { AdministratorAddLevelForm, EditLevelSkills } from "Components/Level";
import { LevelProvider } from "Context/Level";
import { PageWrapper } from "Components/PageWrapper";

const AdministratorEditLevelSkillsPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "level",
      },
    });
  }, []);

  return (
    <PageWrapper>
      <LevelProvider>
        <div className="">
          <EditLevelSkills />
        </div>
      </LevelProvider>
    </PageWrapper>
  );
};

export default AdministratorEditLevelSkillsPage;
