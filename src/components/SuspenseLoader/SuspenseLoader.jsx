import React, { Suspense } from "react";
import { Spinner } from "Assets/svgs";

const SuspenseLoader = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className={`flex h-screen w-full items-center justify-center`}>
          <Spinner size={100} color="#000" />
        </div>
      }
    >
      <div className="w-full overflow-y-auto overflow-x-hidden">{children}</div>
    </Suspense>
  );
};

export default SuspenseLoader;
