import React, { Suspense, memo } from "react";

import { AdminHeader } from "Components/AdminHeader";
import { AdministratorTopHeader, TopHeader } from "Components/TopHeader";
import { Spinner } from "Assets/svgs";
import { useContext } from "react";
import { GlobalContext } from "Context/Global";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { useEffect } from "react";
import { AuthContext } from "Context/Auth";
import { JsonParseObj, updateColors } from "Utils/utils";
const navigation = [];

const AdminWrapper = ({ children }) => {
  const authState = useContext(AuthContext);
  const {
    dispatch: globalDispatch,

    setLabels,
  } = useContext(GlobalContext);
  const { organization_id } = authState?.state;

  const [isfetching, setIsFetching] = useState(false);

  const fetchOrgDetails = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("organization")
        .select("colors")
        .eq("id", organization_id) // 👈 change to the specific org ID you want to fetch
        .single();

      const { data: labels, error: labelError } = await supabase
        .from("organization_labels")
        .select("*")
        .eq("organization_id", organization_id)
        .single();

      if (!error) {
        const colors = JsonParseObj(data?.colors);
        updateColors(colors);
      }

      if (!labelError) {
        setLabels(labels);
      }
    } catch (error) {
      console.log("failed to fetch", error?.message);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  return (
    <div
      id="administrator_wrapper"
      className={`flex w-full max-w-full flex-col`}
    >
      <div className={`mb-20 w-full overflow-hidden`}>
        <AdministratorTopHeader />
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

export default memo(AdminWrapper);
