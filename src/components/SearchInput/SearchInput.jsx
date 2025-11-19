import { MkdInput } from "Components/MkdInput";
import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchInput({
  register,
  errors,
  name,
  placeholder,
  className = "",
  parentClassName = "",
}) {
  return (
    <div
      className={`flex items-center gap-3 border-b bg-white shadow pl-4 w-full ${
        errors[name]?.message ? " border-red-500" : "border-b-accent"
      } ${parentClassName}`}
    >
      {/* Search Icon */}
      <FaSearch className="text-neutral-gray" size={18} />

      <input
        type={"text"}
        id={name}
        // disabled={disabled}
        placeholder={placeholder || "Search"}
        {...register(name)}
        style={{ borderBottom: "none" }}
        className={`focus:shadow-outline w-full resize-none appearance-none  px-4 py-3 flex-1 !text-base leading-tight   outline-none  focus:outline-none ${className} `}
      />
    </div>
  );
}
