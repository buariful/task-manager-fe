import React from "react";
import { GlobalContext, showToast } from "Context/Global";
import { AdministratorAddLevelForm, UserAddLevelForm } from "Components/Level";
import { LevelProvider } from "Context/Level";
import { PageWrapper } from "Components/PageWrapper";

const AdministratorAddLevelPage = () => {
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
          <UserAddLevelForm />
        </div>
      </LevelProvider>
    </PageWrapper>
  );
};

export default AdministratorAddLevelPage;
