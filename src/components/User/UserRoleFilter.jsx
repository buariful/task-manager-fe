import { Spinner } from "Assets/svgs";
import { AuthContext } from "Context/Auth";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { useCallback } from "react";
import { supabase } from "Src/supabase";

export default function UserRoleFilter({ visible, filters, setFilters }) {
  const [roles, setRoles] = useState([]);

  const { state } = useContext(AuthContext);

  const handleRoleToggle = (e, value) => {
    const currentValues = filters?.roleIds || [];
    const newValues = e.target.checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    setFilters((prev) => ({ ...prev, roleIds: newValues }));
  };

  const getData = async () => {
    try {
      let query = supabase
        .from("roles")
        .select("id, name")
        .eq("organization_id", state?.organization_id)
        .eq("access_type", "user");

      const { data, error } = await query;
      if (error) throw error;

      const formatted = data.map((lvl) => ({
        label: lvl?.name,
        value: lvl?.id,
      }));
      setRoles(formatted);
    } catch (err) {
      console.error(err.message);
      setRoles([]);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div style={{ display: visible ? "block" : "none" }}>
      <div className="space-y-3">
        <div className="space-y-2">
          {roles?.map((option) => (
            <label
              key={option.value}
              className="flex capitalize items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters?.roleIds?.includes(option.value) || false}
                onChange={(e) => handleRoleToggle(e, option.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
