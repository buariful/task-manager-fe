import React, { Suspense, memo } from "react";
import { SuperAdminTopHeader, TopHeader } from "Components/TopHeader";
import { Spinner } from "Assets/svgs";
import { useContext } from "react";
import { GlobalContext } from "Context/Global";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { useEffect } from "react";
import { AuthContext } from "Context/Auth";
import { JsonParseObj, updateColors } from "Utils/utils";
const navigation = [];

const SuperAdminWrapper = ({ children }) => {
  const authState = useContext(AuthContext);
  const {
    dispatch: globalDispatch,

    setLabels,
  } = useContext(GlobalContext);
  const { organization_id } = authState?.state;

  const [isfetching, setIsFetching] = useState(false);

  return (
    <div id="super_admin_wrapper" className={`flex w-full max-w-full flex-col`}>
      <div className={`mb-20 w-full overflow-hidden`}>
        <SuperAdminTopHeader />
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

export default memo(SuperAdminWrapper);
