import React, { createContext, useContext, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  return (
    <UserContext.Provider
      value={{
        permissions,
        setPermissions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  return useContext(UserContext);
};

export const usePermission = (name) => {
  const { permissions } = useUserData();
  return (
    permissions?.find((p) => p?.name?.toLowerCase() === name?.toLowerCase()) ||
    {}
  );
};
export const useUserViewPermissions = (name) => {
  const { permissions } = useUserData();
  const result = [];

  permissions?.map((p) => {
    if (p?.view) result.push(p.name?.toLowerCase());
  });

  return result;
};

export default UserProvider;
