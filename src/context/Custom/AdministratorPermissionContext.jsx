import React, { createContext, useContext, useState } from "react";

export const AdministratorPermissionContext = createContext();

const AdministratorPermissionProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissions, setPermissions] = useState([]);

  return (
    <AdministratorPermissionContext.Provider
      value={{
        roles,
        setRoles,
        permissions,
        setPermissions,
        selectedRoleId,
        setSelectedRoleId,
      }}
    >
      {children}
    </AdministratorPermissionContext.Provider>
  );
};

// custom hook for easy use
export const useAdministratorPermission = () => {
  return useContext(AdministratorPermissionContext);
};

export default AdministratorPermissionProvider;
