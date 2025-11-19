import React from "react";

import { GlobalContext } from "Context/Global";
import { AdministratorAddLevelForm, EditLevelSkills } from "Components/Level";
import { LevelProvider } from "Context/Level";
import { PageWrapper } from "Components/PageWrapper";
import { fetchSinglePermission } from "Utils/utils";
import { AuthContext } from "Context/Auth";
import { FullPageLoader } from "Components/FullPageLoader";
import { PermissionWarning } from "Components/PermissionWarning";

const UserEditLevelSkillsPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { state } = React.useContext(AuthContext);

  const [levelPermissions, setLevelPermissions] = React.useState({});
  const [skillPermissions, setSkillPermissions] = React.useState({});
  const [isFetching, setIsFetching] = React.useState(false);

  const getPermissions = async () => {
    setIsFetching(true);
    try {
      const [levelRes, skillRes] = await Promise.all([
        fetchSinglePermission(state?.organization_id, "level", state?.role_id),
        fetchSinglePermission(state?.organization_id, "skill", state?.role_id),
      ]);

      setLevelPermissions(levelRes?.data);
      setSkillPermissions(skillRes?.data);
    } catch (error) {
      console.error("getPermissions ->>", error?.message);
    } finally {
      setIsFetching(false);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "level",
      },
    });

    getPermissions();
  }, []);

  return (
    <PageWrapper>
      {isFetching ? (
        <FullPageLoader />
      ) : levelPermissions?.add ? (
        <LevelProvider>
          <div className="">
            <EditLevelSkills hasAddSkillPermission={skillPermissions?.add} />
          </div>
        </LevelProvider>
      ) : (
        <PermissionWarning />
      )}
    </PageWrapper>
  );
};

export default UserEditLevelSkillsPage;
