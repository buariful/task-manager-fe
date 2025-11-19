import React from "react";

export default function Card({ children, className }) {
  return (
    <div className={`bg-white shadow rounded-lg p-8 ${className}`}>
      {children}
    </div>
  );
}
