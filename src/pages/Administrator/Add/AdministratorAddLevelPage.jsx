import React, { useRef, useState } from "react";

import { GlobalContext, showToast } from "Context/Global";
import { InteractiveButton } from "Components/InteractiveButton";
import { MkdTabContainer } from "Components/MkdTabContainer";
import { FaArrowLeft } from "react-icons/fa6";
import { AdministratorAddLevelForm } from "Components/Level";
import { Link, useNavigate } from "react-router-dom";
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
          <AdministratorAddLevelForm />
        </div>
      </LevelProvider>
    </PageWrapper>
  );
};

export default AdministratorAddLevelPage;
