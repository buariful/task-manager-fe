import React, { memo, useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "Context/Auth";
import metadataJSON from "Utils/metadata.json";
import { capitalizeString } from "Utils/utils";

const AdminRoute = ({ path, children }) => {
  const Auth = useContext(AuthContext);

  const { isAuthenticated, role } = Auth?.state;
  React.useEffect(() => {
    const metadata = metadataJSON[path ?? "/"];
    if (metadata !== undefined) {
      // document.title = metadata?.title?metadata?.title:"staci_j";
      document.title = capitalizeString(metadata?.title)
        ? capitalizeString(metadata?.title)
        : "Staci_j";
    } else {
      document.title = "staci_j";
    }
  }, [path]);

  return (
    <>
      {isAuthenticated ? (
        <>{children}</>
      ) : (
        <Navigate to="/admin/login" replace />
      )}
    </>
  );
};

export default memo(AdminRoute);
