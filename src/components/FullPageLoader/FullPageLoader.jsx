import React from "react";
import MoonLoader from "react-spinners/MoonLoader";

export default function FullPageLoader({ color = "#000", size = 100 }) {
  return (
    <div className="h-screen w-full py-10 grid place-content-center">
      <MoonLoader color={color} loading={true} size={size} />
    </div>
  );
}
