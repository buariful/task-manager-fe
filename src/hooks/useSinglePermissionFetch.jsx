import { AuthContext } from "Context/Auth";
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { fetchSinglePermission } from "Utils/utils";

export const usePermissionFetcher = (permissionName) => {
  const { state } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPermission = async () => {
      if (!permissionName || !state?.organization_id || !state?.role_id) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchSinglePermission(
          state.organization_id,
          permissionName,
          state.role_id
        );
        setData(result?.data || null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadPermission();
  }, [permissionName, state?.organization_id, state?.role_id]);

  return { data, loading, error };
};
