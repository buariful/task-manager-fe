import React from "react";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";

const AdminDashboardPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "admin",
      },
    });
  }, []);
  return (
    <div className="px-10 py-5">
      <div className=" flex h-screen w-full items-center justify-center rounded-lg bg-white text-4xl text-gray-700 shadow-lg md:text-7xl  ">
        Dashboard
      </div>
    </div>
  );
};

export default AdminDashboardPage;
