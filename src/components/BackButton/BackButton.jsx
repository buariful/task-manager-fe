import React from "react";

import { NavLink } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

const BackButton = ({ text = "back", link }) => {
  return (
    <div>
      <NavLink className="flex items-center gap-3 " to={link ? link : -1}>
        <FaArrowLeft />
        <h2 className="text-xl font-semibold text-accent">{text}</h2>
      </NavLink>
    </div>
  );
};

export default BackButton;
