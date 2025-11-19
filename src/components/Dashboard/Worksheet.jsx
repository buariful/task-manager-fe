import React from "react";

export default function Worksheet() {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
      <h3 className="text-gray-500 text-sm">Worksheet Generated</h3>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold">100</p>
          <span className="text-[10px]">TOTAL</span>
        </div>
        <div className="mt-2 text-gray-500 flex items-center gap-4">
          <div>
            <p className="text-lg">645</p>
            <p className="text-[10px] font-medium">ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
