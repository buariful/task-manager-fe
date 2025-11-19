import React from "react";
import { Loader } from "Components/Loader";
import { AuthContext } from "Context/Auth";

const NotFoundPage = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const interval = setTimeout(() => {
      setLoading(false);
    }, 5000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex h-screen w-full items-center justify-center text-7xl text-gray-700 ">
          Not Found
        </div>
      )}
    </>
  );
};

export default NotFoundPage;
