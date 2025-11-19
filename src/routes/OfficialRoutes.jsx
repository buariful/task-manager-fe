import React, { memo, useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "Context/Auth";
import metadataJSON from "Utils/metadata.json";
import { capitalizeString } from "Utils/utils";

const OfficialRoute = ({ path, children }) => {
  const Auth = useContext(AuthContext);

  const { isAuthenticated, role } = Auth?.state;
  React.useEffect(() => {
    const metadata = metadataJSON[path ?? "/"];
    if (metadata !== undefined) {
      // document.title = metadata?.title ? metadata?.title : "Staci_j";
      document.title = capitalizeString(metadata?.title)
        ? capitalizeString(metadata?.title)
        : "P2S";
    } else {
      document.title = "P2S";
    }
  }, [path]);

  return (
    <>
      {isAuthenticated ? (
        <>{children}</>
      ) : (
        <Navigate to="/official/login" replace />
      )}
    </>
  );
};

export default memo(OfficialRoute);
