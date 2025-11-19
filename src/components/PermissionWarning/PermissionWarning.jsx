import React from "react";

export default function PermissionWarning({ message = "Permission Denied" }) {
  return (
    <div className="grid place-content-center h-[70vh] w-full">
      <p className="text-red-500 bg-red-100 border-red-500 inline-block p-2 rounded">
        {message}
      </p>
    </div>
  );
}
