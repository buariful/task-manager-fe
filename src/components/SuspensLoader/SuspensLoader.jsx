import { Spinner } from "Assets/svgs";
import React, { Suspense } from "react";

export default function SuspensLoader({ children }) {
  return (
    <div>
      <Suspense
        fallback={
          <div className={`flex h-screen w-full items-center justify-center`}>
            <Spinner size={100} color="#000" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
