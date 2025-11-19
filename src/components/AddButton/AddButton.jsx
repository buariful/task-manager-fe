import React from "react";
import { NavLink } from "react-router-dom";
import { LuPlusCircle } from "react-icons/lu";

const AddButton = ({ link, text, withIcon = true }) => {
  return (
    <>
      <NavLink
        to={link}
        className="group mx-1 flex cursor-pointer items-center gap-1  text-center text-sm font-medium text-[#3E8EE7] disabled:cursor-not-allowed"
      >
        {/* {withIcon && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-plus"
            viewBox="0 0 16 16"
          >
            {" "}
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />{" "}
          </svg>
        )} */}
        <LuPlusCircle className="text-xl" />
        <span className="border-b border-b-transparent group-hover:border-b-[#3E8EE7]">
          {text || "Add New"}
        </span>
      </NavLink>
    </>
  );
};

export default AddButton;
