import React from "react";

export default function RadioInput({ register, name, label, value }) {
  return (
    <div>
      <label className="mr-4 flex gap-2 items-center">
        <input
          className="text-primary focus:ring-0 w-4 h-4"
          type="radio"
          value={value}
          {...register(name)}
        />
        {label}
      </label>
    </div>
  );
}
