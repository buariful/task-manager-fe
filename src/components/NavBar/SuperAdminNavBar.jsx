import { GlobalContext } from "Context/Global";
import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const links = [
  { label: "Dashboard", link: "/super-admin/dashboard", key: "dashboard" },
  {
    label: "Organizations",
    link: "/super-admin/organization",
    key: "organization",
  },
  {
    label: "Global Admins",
    link: "/super-admin/global-admin",
    key: "global-admin",
  },
];

export default function SuperAdminNavBar() {
  const { state, labels } = React.useContext(GlobalContext);
  const [menuLinks, setMenuLinks] = React.useState(links);

  return (
    <div className="mb-7">
      {/* Navigation Tabs */}
      <nav className="flex gap-5 px-6  text-sm bg-white text-gray-600 ">
        {menuLinks?.map((item, i) => (
          <Link
            key={i}
            className={`relative py-1 px-4 border-b-2 border-transparent   transition text-neutral hover:text-neutral-default hover:border-neutral-default text-xl 
                ${
                  state.path === item.key ? "border-b-primary text-primary" : ""
                }`}
            to={item.link}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
