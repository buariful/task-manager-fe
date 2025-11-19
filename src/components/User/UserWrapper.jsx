import React, { Suspense, memo } from "react";

import { AdministratorTopHeader, UserTopHeader } from "Components/TopHeader";
import { Spinner } from "Assets/svgs";
import { useContext } from "react";
import { GlobalContext } from "Context/Global";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { useEffect } from "react";
import { AuthContext } from "Context/Auth";
import { JsonParseObj, updateColors } from "Utils/utils";
import { useUserData } from "Context/Custom";
const navigation = [];

const UserWrapper = ({ children }) => {
  const authState = useContext(AuthContext);
  const { setPermissions } = useUserData();

  const {
    dispatch: globalDispatch,

    setLabels,
  } = useContext(GlobalContext);
  const { organization_id, role_id } = authState?.state;

  const [isfetching, setIsFetching] = useState(false);

  const getData = async () => {
    setIsFetching(true);
    try {
      // organization details
      const { data, error } = await supabase
        .from("organization")
        .select("colors")
        .eq("id", organization_id)
        .single();

      if (!error) {
        const colors = JsonParseObj(data?.colors);
        updateColors(colors);
      }

      // label details
      const { data: labels, error: labelError } = await supabase
        .from("organization_labels")
        .select("*")
        .eq("organization_id", organization_id)
        .single();

      if (!labelError) {
        setLabels(labels);
      }

      // permissions
      const { data: permissions, error: permissionError } = await supabase
        .from("permission")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("role_id", role_id);

      if (!permissionError) {
        setPermissions(permissions);
      }
    } catch (error) {
      console.log("failed to fetch", error?.message);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div
      id="administrator_wrapper"
      className={`flex w-full max-w-full flex-col`}
    >
      <div className={`mb-20 w-full overflow-hidden`}>
        <UserTopHeader />
        <Suspense
          fallback={
            <div className={`flex h-screen w-full items-center justify-center`}>
              <Spinner size={100} />
            </div>
          }
        >
          <div className="w-full overflow-y-auto overflow-x-hidden">
            {isfetching ? (
              <div
                className={`flex h-screen w-full items-center justify-center`}
              >
                <Spinner size={100} />
              </div>
            ) : (
              children
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default memo(UserWrapper);
