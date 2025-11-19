import { Spinner } from "Assets/svgs";
import { AuthContext } from "Context/Auth";
import { useAdministratorPermission } from "Context/Custom";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { supabase } from "Src/supabase";

export default function PermissionSideBar() {
  const { state } = useContext(AuthContext);
  const { organization_id } = state;
  const {
    roles,
    setRoles,
    selectedRoleId,
    setSelectedRoleId,
    permissions,
    setPermissions,
  } = useAdministratorPermission();
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("access_type", "user")
        .order("id", { ascending: false });
      console.log(data);

      setRoles(data);
      setSelectedRoleId(data[0]?.id || null);
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="w-48 p-2 h-full min-h-80">
      {loading ? (
        <div className="grid place-content-center min-h-12">
          <Spinner size={20} color="#000" />
        </div>
      ) : (
        <ul>
          {roles?.map((item, i) => (
            <li key={i}>
              <button
                onClick={() => {
                  setSelectedRoleId(item?.id);
                }}
                className={`w-full capitalize p-2 rounded-2 ${
                  item?.id === selectedRoleId ? "bg-light-info" : ""
                }`}
              >
                {item?.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
