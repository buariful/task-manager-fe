import { InteractiveButton } from "Components/InteractiveButton";
import { ToggleButton } from "Components/ToggleButton";
import { AuthContext } from "Context/Auth";
import { useAdministratorPermission } from "Context/Custom";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { supabase } from "Src/supabase";
import SinglePermisstion from "./SinglePermisstion";
import { FullPageLoader } from "Components/FullPageLoader";

export default function Permissions() {
  const { state } = useContext(AuthContext);
  const { organization_id } = state;
  const { permissions, setPermissions, selectedRoleId, setSelectedRoleId } =
    useAdministratorPermission();

  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("permission")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("role_id", selectedRoleId)
        .order("name", { ascending: true });
      console.log(data);

      setPermissions(data);
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setLoading(false);
  };

  const handleToggleBtnChange = async (value, field, id) => {
    try {
      // 1. Update local state
      setPermissions((prev) =>
        prev.map((perm) =>
          perm.id === id ? { ...perm, [field]: value } : perm
        )
      );

      // 2. Update in Supabase
      const { data, error } = await supabase
        .from("permission") // your table name
        .update({ [field]: value }) // dynamic column update
        .eq("id", id)
        .select(); // optional, returns updated row

      if (error) {
        console.error("Supabase update error:", error.message);
      } else {
        console.log("Updated row:", data);
      }
    } catch (error) {
      console.error("Unexpected error:", error.message);
    }
  };

  useEffect(() => {
    if (selectedRoleId) {
      getData();
    }
  }, [selectedRoleId]);

  return (
    <div className="p-6">
      <div className="flex justify-end">
        {/* <InteractiveButton isSecondaryBtn={true}>Edit Role</InteractiveButton> */}
      </div>
      {loading ? (
        <FullPageLoader />
      ) : (
        permissions?.map((item, i) => (
          <SinglePermisstion
            key={i}
            data={item}
            onChangeFn={handleToggleBtnChange}
          />
        ))
      )}
    </div>
  );
}
